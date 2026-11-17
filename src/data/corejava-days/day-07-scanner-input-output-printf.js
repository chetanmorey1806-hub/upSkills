const j = String.raw;

const ex1 = j`import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.println("Enter your name:");
        String name = sc.nextLine();

        System.out.println("Enter your age:");
        int age = sc.nextInt();

        System.out.println("Hello " + name + "! Next year you will be " + (age + 1) + ".");
        sc.close();
    }
}`;

const ex2 = j`import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.println("Enter roll number:");
        int roll = sc.nextInt();
        sc.nextLine();                 // consume the leftover Enter (newline)

        System.out.println("Enter full name:");
        String name = sc.nextLine();   // now reads "Ravi Kumar" correctly

        System.out.println("Roll: " + roll + ", Name: " + name);
        sc.close();
    }
}`;

const ex3 = j`public class Main {
    public static void main(String[] args) {
        System.out.print("A");
        System.out.print("B");
        System.out.println("C");
        System.out.println("D");

        String item = "Laptop";
        double price = 45999.5;
        int qty = 2;

        System.out.printf("Item: %s%n", item);
        System.out.printf("Price: %.2f%n", price);
        System.out.printf("Qty: %d, Total: %.1f%n", qty, price * qty);
        System.out.printf("|%10s|%-10s|%n", "Right", "Left");
        System.out.printf("|%5d|%-5d|%05d|%n", 42, 42, 42);
        System.out.printf("PI = %.3f%n", Math.PI);
        System.out.printf("%c %b %e%n", 'J', true, 12345.678);

        String msg = String.format("%s scored %d%%", "Asha", 95);
        System.out.println(msg);
    }
}`;

const ex4 = j`import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Enter first number:");
        double a = sc.nextDouble();
        System.out.println("Enter second number:");
        double b = sc.nextDouble();

        System.out.println("----- Results -----");
        System.out.printf("%.2f + %.2f = %.2f%n", a, b, a + b);
        System.out.printf("%.2f - %.2f = %.2f%n", a, b, a - b);
        System.out.printf("%.2f * %.2f = %.2f%n", a, b, a * b);
        System.out.printf("%.2f / %.2f = %.2f%n", a, b, a / b);
        sc.close();
    }
}`;

const ex5 = j`import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Enter name and 3 marks on one line:");

        String name = sc.next();      // reads one word
        int m1 = sc.nextInt();
        int m2 = sc.nextInt();
        int m3 = sc.nextInt();

        int total = m1 + m2 + m3;
        double average = total / 3.0;
        boolean passed = average >= 40;

        System.out.printf("%-8s|%6s|%8s|%n", "Name", "Total", "Average");
        System.out.printf("%-8s|%6d|%8.2f|%n", name, total, average);
        System.out.println("Passed: " + passed);
        sc.close();
    }
}`;

export default {
  id: 'day-07-scanner-input-output-printf',
  title: 'Taking Input with Scanner, Output with print/println/printf',
  module: 'Module 1: Java Basics',
  day: 7,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Make programs interactive by reading keyboard input with the Scanner class, and produce clean, well-formatted output using print, println, printf and String.format.',
  objectives: [
    'Create a Scanner object and read int, double, boolean, word and full-line input',
    'Avoid the nextInt() followed by nextLine() newline trap',
    'Explain the difference between print, println and printf',
    'Format numbers and text with %d, %f, %s, %c, %b, %n, width and precision',
    'Provide input to programs in Eclipse and IntelliJ consoles',
  ],
  theory: [
    {
      heading: 'The Scanner Class',
      content: j`Scanner (in package java.util) reads input from the keyboard, a file or a String. It breaks input into tokens separated by whitespace (spaces, tabs, new lines).

Analogy: Scanner is like a cashier reading items off a conveyor belt one by one. next() picks up one item (word); nextLine() picks up everything until the end of the belt section (line).

Steps:
1. import java.util.Scanner;
2. Scanner sc = new Scanner(System.in);   // System.in = keyboard
3. Call a method to read: sc.nextInt(), sc.nextLine() ...
4. sc.close(); when done (optional for System.in in small programs).`,
      syntax: j`import java.util.Scanner;

Scanner sc = new Scanner(System.in);
int age = sc.nextInt();
String city = sc.next();
String address = sc.nextLine();`,
    },
    {
      heading: 'Scanner Methods',
      content: j`Method              Reads                                   Example input -> value
nextInt()           an int                                  25 -> 25
nextLong()          a long                                  9000000000
nextDouble()        a double                                45.75
nextFloat()         a float                                 3.5
nextBoolean()       true/false                              true
next()              one word (till space)                   Ravi Kumar -> "Ravi"
nextLine()          the whole remaining line                Ravi Kumar -> "Ravi Kumar"
next().charAt(0)    a single char                           Y -> 'Y'
hasNextInt()        checks if next token is an int          returns boolean
hasNext()           checks if there is any more input

If the user types text where a number is expected, nextInt() throws InputMismatchException. If input ends, NoSuchElementException is thrown.`,
      tip: 'There is no nextChar() method. Use sc.next().charAt(0).',
    },
    {
      heading: 'The nextInt() + nextLine() Trap',
      content: j`When you type 101 and press Enter, the input buffer contains: 1 0 1 \n
- nextInt() reads 101 but LEAVES the \n in the buffer.
- The following nextLine() immediately reads that leftover \n and returns an empty String "".

Fix options:
1. Call an extra sc.nextLine(); after nextInt() to consume the leftover newline.
2. Read everything with nextLine() and convert: int roll = Integer.parseInt(sc.nextLine());

This is one of the most common beginner bugs and a popular interview question.`,
    },
    {
      heading: 'print vs println vs printf',
      content: j`System.out is a PrintStream object connected to the console.

- print(x): prints x and keeps the cursor on the same line.
- println(x): prints x and then moves to a new line. println() alone prints an empty line.
- printf(format, args...): prints formatted text. Does NOT add a new line automatically - use %n.
- String.format(format, args...): same formatting but returns a String instead of printing.

Escape sequences inside strings:
\n  new line      \t  tab        \"  double quote
\\  backslash     \'  single quote`,
    },
    {
      heading: 'Format Specifiers for printf',
      content: j`%d    integer (byte, short, int, long)       printf("%d", 42)        -> 42
%f    floating point (default 6 decimals)    printf("%f", 2.5)       -> 2.500000
%.2f  2 digits after the decimal point       printf("%.2f", 3.14159) -> 3.14
%s    String (or any object via toString)    printf("%s", "Hi")      -> Hi
%c    character                              printf("%c", 'A')       -> A
%b    boolean                                printf("%b", true)      -> true
%e    scientific notation                    printf("%e", 12345.678) -> 1.234568e+04
%n    platform-independent new line
%%    a literal percent sign

Width and alignment:
%10s   right-align in 10 characters      |     Hello|
%-10s  left-align in 10 characters       |Hello     |
%5d    right-align number in 5 chars     |   42|
%05d   pad with zeros                    |00042|
%,d    thousands separator               1,234,567 (depends on locale)
%8.2f  width 8 with 2 decimals           |   45.50|`,
      tip: 'Mismatched specifiers throw an exception at runtime: printf("%d", 2.5) gives IllegalFormatConversionException. %f needs a double/float and %d needs an integer type.',
    },
    {
      heading: 'Giving Input in Eclipse and IntelliJ',
      content: j`- Eclipse: Run the program. Click inside the Console view, type the value and press Enter. Input text appears in green.
- IntelliJ IDEA: Run the program. Click inside the Run window at the bottom, type and press Enter. Input text appears in green.
- Command line: java Main and type into the terminal. You can also redirect a file: java Main < input.txt

Note: the text you type is shown on screen by the console, but it is NOT part of the program output. The expected results in this course show only what the program prints.`,
    },
  ],
  examples: [
    {
      title: 'Reading a name and an age',
      scenario: 'Greet the user by name and tell their age next year.',
      steps: [
        'Create class Main and add import java.util.Scanner; above the class',
        'Run the program (Shift + F10 in IntelliJ / Ctrl + F11 in Eclipse)',
        'In the console type Priya and press Enter, then type 22 and press Enter',
      ],
      code: ex1,
      java: { files: { 'Main.java': ex1 }, stdin: 'Priya\n22\n' },
      result: `Enter your name:
Enter your age:
Hello Priya! Next year you will be 23.`,
      explanation: 'nextLine() reads the whole line "Priya". nextInt() reads 22. The typed input is not part of the program output, so only the prompts and the final message appear. (age + 1) is in brackets so 22 + 1 = 23 is calculated before concatenation.',
    },
    {
      title: 'Fixing the nextInt() then nextLine() problem',
      scenario: 'Read a roll number and then a full name containing a space.',
      steps: [
        'Type the program including the extra sc.nextLine() after nextInt()',
        'Run and enter 101, press Enter, then Ravi Kumar and press Enter',
        'Remove the extra sc.nextLine() and run again to see the name become empty',
      ],
      code: ex2,
      java: { files: { 'Main.java': ex2 }, stdin: '101\nRavi Kumar\n' },
      result: `Enter roll number:
Enter full name:
Roll: 101, Name: Ravi Kumar`,
      explanation: 'nextInt() leaves the newline after 101 in the buffer. The extra sc.nextLine() swallows it, so the next nextLine() reads "Ravi Kumar". Without the fix, name would be "" and the output would be "Roll: 101, Name: ".',
    },
    {
      title: 'print, println and printf formatting',
      scenario: 'Print a product line with currency formatting, aligned columns and special specifiers.',
      steps: [
        'Type the program (no input needed)',
        'Notice %n at the end of each printf for a new line',
        'Run and compare each format specifier with its output',
      ],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `ABC
D
Item: Laptop
Price: 45999.50
Qty: 2, Total: 91999.0
|     Right|Left      |
|   42|42   |00042|
PI = 3.142
J true 1.234568e+04
Asha scored 95%`,
      explanation: 'print keeps A, B and C on one line; println("C") then moves to a new line. %.2f shows 45999.5 as 45999.50. 45999.5 * 2 = 91999.0. %10s pads on the left to width 10, %-10s pads on the right. %05d pads 42 with zeros. Math.PI rounded to 3 decimals is 3.142. %e gives scientific notation with 6 decimals. %% prints a single %.',
    },
    {
      title: 'Simple calculator with formatted output',
      scenario: 'Read two decimal numbers and show the four arithmetic results to 2 decimal places.',
      steps: [
        'Create class Main with a Scanner',
        'Read two doubles using nextDouble()',
        'Run and enter 15 and 4',
      ],
      code: ex4,
      java: { files: { 'Main.java': ex4 }, stdin: '15\n4\n' },
      result: `Enter first number:
Enter second number:
----- Results -----
15.00 + 4.00 = 19.00
15.00 - 4.00 = 11.00
15.00 * 4.00 = 60.00
15.00 / 4.00 = 3.75`,
      explanation: 'nextDouble() accepts 15 and converts it to 15.0. 15 + 4 = 19, 15 - 4 = 11, 15 * 4 = 60, 15 / 4 = 3.75. %.2f always shows exactly two decimal places.',
    },
    {
      title: 'Several values on one line and a formatted report',
      scenario: 'Read a student name and three marks typed on a single line and print a small table.',
      steps: [
        'Type the program',
        'Run and type: Amit 85 90 78 then press Enter',
        'Scanner splits the line into 4 tokens automatically',
      ],
      code: ex5,
      java: { files: { 'Main.java': ex5 }, stdin: 'Amit 85 90 78\n' },
      result: `Enter name and 3 marks on one line:
Name    | Total| Average|
Amit    |   253|   84.33|
Passed: true`,
      explanation: 'next() reads the word Amit, then each nextInt() reads the next number. total = 85 + 90 + 78 = 253. 253 / 3.0 = 84.333... shown as 84.33. %-8s left-aligns in 8 columns, %6d and %8.2f right-align numbers so the columns line up.',
    },
  ],
  interview: [
    { q: 'Which package contains Scanner?', a: 'java.util. You must import java.util.Scanner (java.lang classes like String and System need no import).', level: 'Easy' },
    { q: 'Difference between next() and nextLine()?', a: 'next() reads a single token up to whitespace. nextLine() reads the rest of the current line including spaces and consumes the newline.', level: 'Easy' },
    { q: 'Why does nextLine() return an empty string after nextInt()?', a: 'nextInt() does not consume the newline character left by Enter. nextLine() reads that leftover newline. Fix with an extra nextLine() or by reading lines and parsing.', level: 'Medium' },
    { q: 'How do you read a char with Scanner?', a: 'sc.next().charAt(0). Scanner has no nextChar() method.', level: 'Easy' },
    { q: 'Difference between println and printf?', a: 'println prints the value followed by a new line. printf prints text formatted with specifiers like %d and %.2f and does not add a new line unless %n or \\n is used.', level: 'Easy' },
    { q: 'What exception occurs if the user types "abc" for nextInt()?', a: 'java.util.InputMismatchException.', level: 'Medium' },
    { q: 'What is the output: System.out.printf("%.1f", 2.75);', a: '2.8. printf uses HALF_UP rounding on the decimal value.', level: 'Medium' },
    { q: 'What is the difference between %n and \\n?', a: '%n inserts the platform-specific line separator (\\r\\n on Windows, \\n on Linux/macOS). \\n is always just a line feed.', level: 'Medium' },
    { q: 'What is the output: System.out.printf("[%5s][%-5s]", "ab", "cd");', a: '[   ab][cd   ]. Positive width right-aligns, negative width left-aligns.', level: 'Medium' },
    { q: 'Other ways to read input apart from Scanner?', a: 'BufferedReader with InputStreamReader (faster, reads lines), Console (System.console(), supports hidden passwords), and command-line arguments.', level: 'Hard' },
    { q: 'Should you close a Scanner on System.in?', a: 'Closing it also closes System.in, so you cannot read again later in the program. Close it once, at the very end, or not at all in small programs.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Read the radius of a circle and print its area with 2 decimal places.',
      hint: 'area = Math.PI * r * r; use printf("%.2f").',
      solution: j`import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Enter radius:");
        double r = sc.nextDouble();
        double area = Math.PI * r * r;
        System.out.printf("Area = %.2f%n", area);
    }
}`,
    },
    {
      task: 'Read a full address (with spaces) after reading a pin code number, and print both.',
      hint: 'Consume the leftover newline after nextInt().',
      solution: j`import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Enter pin code:");
        int pin = sc.nextInt();
        sc.nextLine();
        System.out.println("Enter address:");
        String address = sc.nextLine();
        System.out.println(address + " - " + pin);
    }
}`,
    },
    {
      task: 'Read a character and print its Unicode value and the next character.',
      hint: 'char c = sc.next().charAt(0);',
      solution: j`import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Enter a character:");
        char c = sc.next().charAt(0);
        System.out.println("Code: " + (int) c);
        System.out.println("Next: " + (char) (c + 1));
    }
}`,
    },
    {
      task: 'Read principal, rate and time and print simple interest and total amount in a formatted table.',
      hint: 'SI = P * R * T / 100. Use %-12s and %10.2f.',
      solution: j`import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Enter principal, rate and years:");
        double p = sc.nextDouble();
        double r = sc.nextDouble();
        int t = sc.nextInt();
        double si = p * r * t / 100;
        System.out.printf("%-12s%10.2f%n", "Principal", p);
        System.out.printf("%-12s%10.2f%n", "Interest", si);
        System.out.printf("%-12s%10.2f%n", "Total", p + si);
    }
}`,
    },
  ],
  quiz: [
    { question: 'Which statement creates a Scanner that reads from the keyboard?', options: ['Scanner sc = new Scanner();', 'Scanner sc = new Scanner(System.out);', 'Scanner sc = new Scanner(System.in);', 'Scanner sc = Scanner.read();'], answer: 2, explanation: 'System.in is the standard input stream (keyboard).' },
    { question: 'Input "Java Full Stack" is read with sc.next(). What is returned?', options: ['Java', 'Java Full Stack', 'Full', 'Empty string'], answer: 0, explanation: 'next() reads only up to the first whitespace.' },
    { question: 'Which format specifier prints a double with 3 decimal places?', options: ['%3d', '%.3f', '%3f.', '%f3'], answer: 1, explanation: '%.3f sets the precision to 3 digits after the decimal point.' },
    { question: 'What does System.out.printf("%05d", 7); print?', options: ['7', '    7', '7    ', '00007'], answer: 3, explanation: 'Width 5 with the 0 flag pads with zeros.' },
    { question: 'Which method does NOT exist in Scanner?', options: ['nextChar()', 'nextBoolean()', 'nextLine()', 'hasNextInt()'], answer: 0, explanation: 'There is no nextChar(); use next().charAt(0).' },
  ],
};
