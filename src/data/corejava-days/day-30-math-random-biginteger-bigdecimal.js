const STEPS = [
  'IntelliJ: File > New > Java Class > Main (Eclipse: File > New > Class, Name = Main)',
  'Type the code (BigInteger and BigDecimal live in java.math; Random in java.util)',
  'Click Run ▶ and compare the output',
];

const ex1 = `public class Main {
    public static void main(String[] args) {
        System.out.println(Math.abs(-7) + " " + Math.abs(-2.5));
        System.out.println(Math.max(10, 25) + " " + Math.min(10, 25));
        System.out.println(Math.pow(2, 10));                  // always returns double
        System.out.println(Math.sqrt(144) + " " + Math.cbrt(27));
        System.out.println(Math.ceil(4.1) + " " + Math.floor(4.9));
        System.out.println(Math.round(4.5) + " " + Math.round(-4.5) + " " + Math.round(2.4f));
        System.out.println(Math.hypot(3, 4));
        System.out.println(Math.PI);
        System.out.println(Math.floorDiv(-7, 2) + " " + (-7 / 2) + " "
                + Math.floorMod(-7, 2) + " " + (-7 % 2));
        System.out.println(Math.signum(-3.2));
    }
}`;

const ex2 = `public class Main {
    public static void main(String[] args) {
        // distance between two points (1,2) and (4,6)
        double x1 = 1, y1 = 2, x2 = 4, y2 = 6;
        double dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        System.out.println("Distance = " + dist);

        double r = 2.5;
        double area = Math.PI * r * r;
        System.out.printf("Circle area = %.2f%n", area);              // formatting only
        System.out.println("Rounded = " + Math.round(area * 100) / 100.0);   // real rounding

        double percent = 437 * 100.0 / 500;
        System.out.println("Percentage = " + percent);

        try {
            int big = Math.addExact(Integer.MAX_VALUE, 1);           // detect overflow
            System.out.println(big);
        } catch (ArithmeticException e) {
            System.out.println("Overflow detected: " + e.getMessage());
        }
    }
}`;

const ex3 = `import java.util.Random;
import java.util.concurrent.ThreadLocalRandom;

public class Main {
    public static void main(String[] args) {
        Random rnd = new Random();

        int dice = rnd.nextInt(6) + 1;                 // 0..5 + 1 = 1..6
        System.out.println("Dice in 1..6? " + (dice >= 1 && dice <= 6));

        int otp = 1000 + rnd.nextInt(9000);            // 1000..9999
        System.out.println("OTP has 4 digits? " + (String.valueOf(otp).length() == 4));

        double m = Math.random();                      // 0.0 <= m < 1.0
        System.out.println("Math.random in [0,1)? " + (m >= 0.0 && m < 1.0));

        Random a = new Random(42), b = new Random(42); // same seed
        boolean same = true;
        for (int i = 0; i < 5; i++) {
            if (a.nextInt(100) != b.nextInt(100)) same = false;
        }
        System.out.println("Same seed, same sequence? " + same);

        int v = ThreadLocalRandom.current().nextInt(10, 21);   // 10..20 (upper bound exclusive)
        System.out.println("Between 10 and 20? " + (v >= 10 && v <= 20));
    }
}`;

const ex4 = `import java.math.BigInteger;

public class Main {
    static BigInteger factorial(int n) {
        BigInteger result = BigInteger.ONE;
        for (int i = 2; i <= n; i++) {
            result = result.multiply(BigInteger.valueOf(i));   // immutable: reassign!
        }
        return result;
    }

    public static void main(String[] args) {
        long maxLong = Long.MAX_VALUE;
        System.out.println("long max     = " + maxLong);
        System.out.println("long max + 1 = " + (maxLong + 1));            // silent overflow
        BigInteger big = BigInteger.valueOf(maxLong).add(BigInteger.ONE);
        System.out.println("BigInteger   = " + big);

        System.out.println("25! = " + factorial(25));
        System.out.println("2^100 = " + BigInteger.TWO.pow(100));

        BigInteger a = new BigInteger("123456789012345678901234567890");
        BigInteger b = new BigInteger("987654321098765432109876543210");
        System.out.println("a + b = " + a.add(b));
        System.out.println("compareTo = " + a.compareTo(b));
        System.out.println("97 prime? " + BigInteger.valueOf(97).isProbablePrime(10));
    }
}`;

const ex5 = `import java.math.BigDecimal;
import java.math.RoundingMode;

public class Main {
    public static void main(String[] args) {
        System.out.println(0.1 + 0.2);                       // binary floating-point error
        System.out.println(1.10 - 1.00);

        BigDecimal a = new BigDecimal("0.1");
        BigDecimal b = new BigDecimal("0.2");
        System.out.println(a.add(b));
        System.out.println(new BigDecimal("1.10").subtract(new BigDecimal("1.00")));
        System.out.println(new BigDecimal(0.1));             // DON'T: exposes the double error
        System.out.println(BigDecimal.valueOf(0.1));         // OK

        BigDecimal price = new BigDecimal("199.99");
        BigDecimal qty = new BigDecimal("3");
        BigDecimal subtotal = price.multiply(qty);
        BigDecimal gst = subtotal.multiply(new BigDecimal("0.18")).setScale(2, RoundingMode.HALF_UP);
        System.out.println("Subtotal = " + subtotal + ", GST = " + gst + ", Total = " + subtotal.add(gst));

        try {
            new BigDecimal("10").divide(new BigDecimal("3"));
        } catch (ArithmeticException e) {
            System.out.println("Error: " + e.getMessage());
        }
        System.out.println(new BigDecimal("10").divide(new BigDecimal("3"), 2, RoundingMode.HALF_UP));

        System.out.println(new BigDecimal("2.50").equals(new BigDecimal("2.5")));     // scale differs
        System.out.println(new BigDecimal("2.50").compareTo(new BigDecimal("2.5")));  // value same
        System.out.println(new BigDecimal("2.345").setScale(2, RoundingMode.HALF_EVEN) + " "
                + new BigDecimal("2.355").setScale(2, RoundingMode.HALF_EVEN));
    }
}`;

const pr1 = `public class Main {
    public static void main(String[] args) {
        double principal = 100000, rate = 8, years = 2;
        double amount = principal * Math.pow(1 + rate / 100, years);   // compound interest
        System.out.printf("Amount = %.2f%n", amount);                   // Amount = 116640.00
        System.out.printf("Interest = %.2f%n", amount - principal);     // Interest = 16640.00
    }
}`;

const pr2 = `import java.util.Random;

public class Main {
    public static void main(String[] args) {
        Random rnd = new Random();
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            code.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        System.out.println("Coupon length: " + code.length());   // Coupon length: 6
        System.out.println("Coupon: " + code);                   // random, e.g. Coupon: K7QZ3M
    }
}`;

const pr3 = `import java.math.BigInteger;

public class Main {
    public static void main(String[] args) {
        BigInteger a = BigInteger.ZERO, b = BigInteger.ONE;
        for (int i = 0; i < 100; i++) {
            BigInteger next = a.add(b);
            a = b;
            b = next;
        }
        System.out.println("Fib(100) = " + a);   // Fib(100) = 354224848179261915075
    }
}`;

const pr4 = `import java.math.BigDecimal;
import java.math.RoundingMode;

public class Main {
    public static void main(String[] args) {
        String[] prices = {"49.99", "15.50", "120.00"};
        BigDecimal total = BigDecimal.ZERO;
        for (String p : prices) {
            total = total.add(new BigDecimal(p));
        }
        BigDecimal discount = total.multiply(new BigDecimal("0.10")).setScale(2, RoundingMode.HALF_UP);
        System.out.println("Total = " + total);                       // Total = 185.49
        System.out.println("Discount = " + discount);                 // Discount = 18.55
        System.out.println("Payable = " + total.subtract(discount));  // Payable = 166.94
    }
}`;

export default {
  id: 'day-30-math-random-biginteger-bigdecimal',
  title: 'Math Class, Random, BigInteger and BigDecimal',
  module: 'Module 5: Core APIs & Generics',
  day: 30,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'Use the Math class for everyday calculations, generate random numbers with Math.random, Random and ThreadLocalRandom, handle huge integers with BigInteger, and do exact money calculations with BigDecimal.',
  objectives: [
    'Use common Math methods and know their return types and rounding rules',
    'Generate random numbers in a given range and explain seeds',
    'Perform arbitrary-precision integer arithmetic with BigInteger',
    'Do exact decimal (money) calculations with BigDecimal and RoundingMode',
  ],
  theory: [
    {
      heading: 'The Math Class',
      content:
        'java.lang.Math is a final utility class with a private constructor and only static methods and constants. Think of it as a scientific calculator built into Java.',
      points: [
        'Math.abs, max, min: return the same type as the arguments.',
        'Math.pow(a, b), sqrt, cbrt, hypot: always return double (Math.pow(2, 3) = 8.0).',
        'Math.ceil (round up) and floor (round down): return double.',
        'Math.round(double) returns long, Math.round(float) returns int; it rounds half UP towards positive infinity: round(4.5) = 5, round(-4.5) = -4.',
        'Math.floorDiv / floorMod round towards negative infinity, unlike / and % which truncate towards zero.',
        'Math.addExact, multiplyExact, toIntExact throw ArithmeticException on overflow instead of silently wrapping.',
        'Constants: Math.PI, Math.E. Math.sqrt(-1) returns NaN (no exception).',
      ],
    },
    {
      heading: 'Random Numbers',
      content:
        'Math.random() returns a double in [0.0, 1.0). java.util.Random gives ints, longs, doubles and booleans: nextInt(n) returns 0 to n-1, so a dice roll is nextInt(6) + 1. A Random created with a seed (new Random(42)) always produces the same sequence, which is useful for tests and simulations. ThreadLocalRandom.current().nextInt(min, maxExclusive) is the recommended choice for multi-threaded code. For passwords, OTPs and tokens use java.security.SecureRandom, which is cryptographically strong.',
      syntax: `int dice = new Random().nextInt(6) + 1;            // 1..6
int n = ThreadLocalRandom.current().nextInt(10, 21);  // 10..20
int r = (int) (Math.random() * 100);                 // 0..99`,
      points: [
        'Formula for range [min, max]: min + rnd.nextInt(max - min + 1).',
        'Random is pseudo-random: deterministic for a given seed.',
      ],
    },
    {
      heading: 'BigInteger',
      content:
        'long can only hold up to 9,223,372,036,854,775,807; beyond that it silently overflows to a negative number. BigInteger (java.math) can hold integers of any size, limited only by memory. Use it for huge factorials, cryptography (RSA), and very large IDs. Analogy: a long is a car odometer that rolls back to zero; BigInteger is a notebook where you can keep writing digits.',
      syntax: `BigInteger a = new BigInteger("123456789012345678901234567890");
BigInteger b = BigInteger.valueOf(100);
BigInteger c = a.add(b).multiply(BigInteger.TWO);`,
      points: [
        'Immutable: a.add(b) returns a NEW object; a itself does not change. Always assign the result.',
        'No operators: use add, subtract, multiply, divide, mod, pow, gcd, compareTo.',
        'Constants: BigInteger.ZERO, ONE, TWO (Java 9+), TEN.',
      ],
    },
    {
      heading: 'Why double is Wrong for Money',
      content:
        'double stores numbers in binary. Many decimal fractions like 0.1 cannot be stored exactly in binary (just like 1/3 cannot be written exactly in decimal), so 0.1 + 0.2 prints 0.30000000000000004. For money, tax, interest and anything that must be exact, use BigDecimal (or store paise/cents in a long).',
    },
    {
      heading: 'BigDecimal',
      content:
        'BigDecimal stores an exact decimal number as an unscaled integer plus a scale (number of digits after the point). 2.50 is unscaled 250 with scale 2.',
      points: [
        'Create from a String (new BigDecimal("0.1")) or BigDecimal.valueOf(double). Avoid new BigDecimal(0.1), which copies the binary error.',
        'Immutable like BigInteger: total = total.add(x).',
        'divide() throws ArithmeticException for non-terminating results (10 / 3) unless you give a scale and RoundingMode.',
        'setScale(2, RoundingMode.HALF_UP) is the usual "school" rounding for money; HALF_EVEN (banker\'s rounding) rounds .5 to the nearest even digit to reduce bias.',
        'equals() compares value AND scale (2.50 != 2.5); compareTo() compares only the value. Use compareTo for checks.',
      ],
      tip: 'In Spring Boot/JPA entities, map price columns (DECIMAL(10,2)) to BigDecimal fields, never to double.',
    },
  ],
  examples: [
    {
      title: 'Common Math Methods',
      scenario: 'Quick tour of the Math methods used most often in programs and interviews.',
      steps: STEPS,
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `7 2.5
25 10
1024.0
12.0 3.0
5.0 4.0
5 -4 2
5.0
3.141592653589793
-4 -3 1 -1
-1.0`,
      explanation:
        'pow, sqrt, cbrt, ceil, floor and hypot return double. round(4.5) = 5 and round(-4.5) = -4 because round adds 0.5 and takes the floor. floorDiv(-7, 2) = -4 while -7 / 2 = -3; floorMod(-7, 2) = 1 while -7 % 2 = -1.',
    },
    {
      title: 'Practical Calculations: Distance, Area, Percentage and Overflow',
      scenario: 'A maps app needs distance, a land app needs circle area, and a result app needs percentage; overflow must be caught.',
      steps: STEPS,
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `Distance = 5.0
Circle area = 19.63
Rounded = 19.63
Percentage = 87.4
Overflow detected: integer overflow`,
      explanation:
        'sqrt(3^2 + 4^2) = 5.0. PI * 2.5 * 2.5 is about 19.6349..., printed with 2 decimals by printf and rounded mathematically with Math.round(area * 100) / 100.0. 437 * 100.0 / 500 = 87.4. addExact throws instead of wrapping around.',
    },
    {
      title: 'Random Numbers in a Range and Seeds',
      scenario: 'A game rolls dice, a login page creates a 4-digit OTP, and a test needs repeatable random data.',
      steps: STEPS,
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Dice in 1..6? true
OTP has 4 digits? true
Math.random in [0,1)? true
Same seed, same sequence? true
Between 10 and 20? true`,
      explanation:
        'The actual random values change every run, so the program prints checks that are always true. Two Random objects with the same seed (42) generate identical sequences. (For real OTPs, use SecureRandom.)',
    },
    {
      title: 'BigInteger for Huge Numbers',
      scenario: 'Compute values that do not fit in a long: 25!, 2^100 and 30-digit sums.',
      steps: STEPS,
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `long max     = 9223372036854775807
long max + 1 = -9223372036854775808
BigInteger   = 9223372036854775808
25! = 15511210043330985984000000
2^100 = 1267650600228229401496703205376
a + b = 1111111110111111111011111111100
compareTo = -1
97 prime? true`,
      explanation:
        'long silently wraps to its minimum value, but BigInteger keeps growing. 25! has 26 digits. compareTo returns -1 because a < b. isProbablePrime(10) is true for 97 (a real prime is never reported as composite).',
    },
    {
      title: 'BigDecimal for Exact Money Calculations',
      scenario: 'A billing system must compute subtotal, 18% GST and total exactly, and handle division and comparisons correctly.',
      steps: STEPS,
      code: ex5,
      java: { files: { 'Main.java': ex5 } },
      result: `0.30000000000000004
0.10000000000000009
0.3
0.10
0.1000000000000000055511151231257827021181583404541015625
0.1
Subtotal = 599.97, GST = 107.99, Total = 707.96
Error: Non-terminating decimal expansion; no exact representable decimal result.
3.33
false
0
2.34 2.36`,
      explanation:
        'double arithmetic shows binary rounding errors; BigDecimal from Strings is exact. 199.99 * 3 = 599.97; 599.97 * 0.18 = 107.9946, rounded HALF_UP to 107.99. 10/3 needs a scale and rounding mode. 2.50 and 2.5 differ in scale (equals false) but are equal in value (compareTo 0). HALF_EVEN rounds 2.345 to 2.34 (4 is even) and 2.355 to 2.36 (6 is even).',
    },
  ],
  interview: [
    {
      q: 'Why can we not create an object of the Math class?',
      a: 'Math has a private constructor and only static members; it is also final so it cannot be subclassed. It is a pure utility class.',
      level: 'Easy',
    },
    {
      q: 'What is the output?\nSystem.out.println(Math.round(2.5) + " " + Math.round(-2.5) + " " + Math.round(-2.6));',
      a: 'Output: 3 -2 -3. Math.round returns floor(x + 0.5): floor(3.0) = 3, floor(-2.0) = -2, floor(-2.1) = -3.',
      level: 'Medium',
    },
    {
      q: 'What is the output?\nSystem.out.println(Math.abs(Integer.MIN_VALUE));',
      a: 'Output: -2147483648. The positive value 2147483648 does not fit in an int, so it overflows back to MIN_VALUE. Use Math.absExact (Java 15+) to get an exception instead.',
      level: 'Hard',
    },
    {
      q: 'Difference between Math.random(), Random, ThreadLocalRandom and SecureRandom?',
      a: 'Math.random() returns a double in [0,1) using a shared Random. Random offers many types and seeds. ThreadLocalRandom avoids contention in multi-threaded code. SecureRandom is cryptographically strong for OTPs, tokens and passwords.',
      level: 'Medium',
    },
    {
      q: 'How do you generate a random int between min and max inclusive?',
      a: 'min + random.nextInt(max - min + 1), or ThreadLocalRandom.current().nextInt(min, max + 1).',
      level: 'Easy',
    },
    {
      q: 'Why should we not use double for currency?',
      a: 'double is binary floating point and cannot represent many decimal fractions exactly (0.1 + 0.2 = 0.30000000000000004). Rounding errors accumulate. Use BigDecimal or integer paise/cents.',
      level: 'Easy',
    },
    {
      q: 'What is the output?\nBigInteger x = BigInteger.TEN; x.add(BigInteger.ONE); System.out.println(x);',
      a: 'Output: 10. BigInteger is immutable; add returns a new object that was not assigned. Correct: x = x.add(BigInteger.ONE);',
      level: 'Medium',
    },
    {
      q: 'Difference between new BigDecimal(0.1), BigDecimal.valueOf(0.1) and new BigDecimal("0.1")?',
      a: 'new BigDecimal(0.1) stores the exact binary value 0.1000000000000000055511151231257827021181583404541015625. valueOf(0.1) uses Double.toString, giving 0.1. new BigDecimal("0.1") is exactly 0.1 and is the safest.',
      level: 'Hard',
    },
    {
      q: 'What is the output?\nSystem.out.println(new BigDecimal("2.0").equals(new BigDecimal("2.00")));',
      a: 'Output: false. equals considers scale (1 vs 2). Use compareTo, which returns 0 here.',
      level: 'Medium',
    },
    {
      q: 'Why does new BigDecimal("1").divide(new BigDecimal("3")) throw an exception?',
      a: '1/3 has a non-terminating decimal expansion, and without a MathContext or scale BigDecimal must return an exact result. Use divide(divisor, scale, RoundingMode) instead.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Compute compound interest on 100000 at 8% for 2 years using Math.pow and print with 2 decimals.',
      hint: 'A = P * (1 + r/100)^n',
      solution: pr1,
    },
    {
      task: 'Generate a random 6-character coupon code from a given character set.',
      hint: 'chars.charAt(rnd.nextInt(chars.length()))',
      solution: pr2,
    },
    {
      task: 'Calculate the 100th Fibonacci number using BigInteger.',
      hint: 'long overflows after Fib(92).',
      solution: pr3,
    },
    {
      task: 'Add up cart prices with BigDecimal, apply a 10% discount rounded HALF_UP, and print the payable amount.',
      hint: 'total = total.add(new BigDecimal(p));',
      solution: pr4,
    },
  ],
  quiz: [
    {
      question: 'What does Math.pow(2, 3) return?',
      options: ['8', '8.0', '6', '9'],
      answer: 1,
      explanation: 'Math.pow always returns a double.',
    },
    {
      question: 'Which expression gives a random int from 1 to 6?',
      options: ['rnd.nextInt(6)', 'rnd.nextInt(7)', 'rnd.nextInt(5) + 1', 'rnd.nextInt(6) + 1'],
      answer: 3,
      explanation: 'nextInt(6) is 0..5; adding 1 gives 1..6.',
    },
    {
      question: 'Which class should you use for exact currency calculations?',
      options: ['BigDecimal', 'double', 'float', 'BigInteger'],
      answer: 0,
      explanation: 'BigDecimal represents decimal values exactly.',
    },
    {
      question: 'new BigDecimal("5.0").compareTo(new BigDecimal("5.00")) returns...',
      options: ['1', '-1', '0', 'false'],
      answer: 2,
      explanation: 'compareTo ignores scale; the values are equal.',
    },
    {
      question: 'What is Math.floorMod(-7, 3)?',
      options: ['-1', '2', '1', '-2'],
      answer: 1,
      explanation: 'floorMod result has the sign of the divisor: -7 = 3 * (-3) + 2.',
    },
  ],
};
