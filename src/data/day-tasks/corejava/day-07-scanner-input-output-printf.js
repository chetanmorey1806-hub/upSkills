export default {
  lesson: 'day-07-scanner-input-output-printf',
  minutes: 20,
  intro: 'Read input with Scanner, avoid the nextInt()/nextLine() trap and format output with printf.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: `Complete the line to read a whole number typed by the user:
\`Scanner sc = new Scanner(System.in);\`
\`int age = sc.____;\``,
      example: { title: 'reading a decimal number', code: 'double price = sc.nextDouble();' },
      accept: ['nextInt()'],
      acceptRegex: ['^nextInt\\s*\\(\\s*\\)\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`nextInt()` reads the next token as an int. Other readers: `nextDouble()`, `nextBoolean()`, `next()` (one word) and `nextLine()` (the rest of the line). Typing letters when nextInt() is waiting throws `InputMismatchException`.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: `The user types \`21\` ⏎ then \`Asha Patil\` ⏎. The code is:
\`int age = sc.nextInt();\`
\`String name = sc.nextLine();\`
What is stored in \`name\`?`,
      options: ['"Asha Patil"', '"Asha"', 'An empty string ""', 'It throws an exception'],
      answer: 2,
      explain: '`nextInt()` reads 21 but leaves the **Enter (newline)** in the buffer. The following `nextLine()` reads that leftover newline and returns "". Fix: call an extra `sc.nextLine();` after nextInt(), or read everything with nextLine() and parse.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this program print? (printf rounds, it does not cut)',
      example: {
        title: 'format specifiers',
        code: `System.out.printf("%d items, ₹%.1f%n", 3, 45.67);
// 3 items, ₹45.7`,
      },
      code: `public class Main {
    public static void main(String[] args) {
        String name = "Ravi";
        int qty = 4;
        double price = 12.756;
        System.out.printf("Name: %s%n", name);
        System.out.printf("Qty: %03d%n", qty);
        System.out.printf("Price: %.2f%n", price);
        System.out.printf("Total: %.1f%n", qty * price);
    }
}`,
      expected: `Name: Ravi
Qty: 004
Price: 12.76
Total: 51.0`,
      explain: '`%s` prints a String, `%03d` pads the int with zeros to width 3 (004), `%.2f` rounds to 2 decimals (12.76) and `%n` is a new line. 4 × 12.756 = 51.024, which `%.1f` shows as 51.0.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'What does this program print?',
      example: {
        title: 'printf does not add a new line by itself',
        code: `System.out.printf("Hi ");
System.out.println("there"); // Hi there`,
      },
      code: `public class Main {
    public static void main(String[] args) {
        System.out.print("Total");
        System.out.printf(" = %d", 50);
        System.out.println("!");
        System.out.printf("%c%c%n", 'O', 'K');
        System.out.println(String.format("%b", 5 > 3));
    }
}`,
      expected: `Total = 50!
OK
true`,
      explain: '`print` and `printf` do **not** add a new line, so the first three calls build one line "Total = 50!". `%c` prints a char and `%b` a boolean. `String.format` returns the formatted text instead of printing it.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Which printf format specifier prints a **String**? (e.g. `%?`)',
      example: { title: 'other specifiers', text: '`%d` → int/long, `%f` → double, `%c` → char, `%n` → new line' },
      accept: ['%s', 's'],
      explain: '`%s` formats a String (in fact any object, using its toString()). Using `%d` for a String throws `IllegalFormatConversionException` at runtime.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about `Scanner` are TRUE? (choose all that apply)',
      options: [
        'It is in the java.util package, so you need import java.util.Scanner;',
        'next() reads one word (stops at a space)',
        'nextLine() reads the rest of the line including spaces',
        'nextInt() can read "12.5"',
        'System.in represents keyboard input',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Scanner lives in `java.util`. `next()` reads one token, `nextLine()` reads until Enter, and `System.in` is the standard input stream (keyboard). `nextInt()` on "12.5" throws `InputMismatchException`: use `nextDouble()` for decimals.',
    },
  ],
};
