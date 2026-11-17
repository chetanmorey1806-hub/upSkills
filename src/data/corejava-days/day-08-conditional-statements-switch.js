const j = String.raw;

const ex1 = j`public class Main {
    public static void main(String[] args) {
        int num = -7;

        if (num < 0) {
            System.out.println(num + " is a negative number");
        }

        if (num % 2 == 0) {
            System.out.println(num + " is even");
        } else {
            System.out.println(num + " is odd");
        }

        int age = 19;
        boolean hasLicence = false;
        if (age >= 18) {
            if (hasLicence) {
                System.out.println("You can drive");
            } else {
                System.out.println("Apply for a driving licence first");
            }
        } else {
            System.out.println("Too young to drive");
        }
    }
}`;

const ex2 = j`import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Enter marks (0-100):");
        int marks = sc.nextInt();

        char grade;
        if (marks < 0 || marks > 100) {
            System.out.println("Invalid marks");
            return;
        } else if (marks >= 90) {
            grade = 'A';
        } else if (marks >= 75) {
            grade = 'B';
        } else if (marks >= 60) {
            grade = 'C';
        } else if (marks >= 40) {
            grade = 'D';
        } else {
            grade = 'F';
        }
        System.out.println("Marks: " + marks + ", Grade: " + grade);
        sc.close();
    }
}`;

const ex3 = j`public class Main {
    public static void main(String[] args) {
        int day = 3;
        switch (day) {
            case 1:
                System.out.println("Monday");
                break;
            case 2:
                System.out.println("Tuesday");
                break;
            case 3:
                System.out.println("Wednesday");
                break;
            default:
                System.out.println("Other day");
        }

        // Fall-through: no break after case 1 and case 2
        int level = 2;
        switch (level) {
            case 1:
                System.out.println("Level 1 unlocked");
            case 2:
                System.out.println("Level 2 unlocked");
            case 3:
                System.out.println("Level 3 unlocked");
                break;
            default:
                System.out.println("Unknown level");
        }

        String city = "Mumbai";
        switch (city) {
            case "Pune":
            case "Mumbai":
                System.out.println(city + " is in Maharashtra");
                break;
            case "Bengaluru":
                System.out.println(city + " is in Karnataka");
                break;
            default:
                System.out.println("State not known");
        }
    }
}`;

const ex4 = j`public class Main {
    public static void main(String[] args) {
        String day = "SAT";
        String type = switch (day) {
            case "MON", "TUE", "WED", "THU", "FRI" -> "Weekday";
            case "SAT", "SUN" -> "Weekend";
            default -> "Invalid";
        };
        System.out.println(day + " is a " + type);

        int month = 2;
        int year = 2024;
        int days = switch (month) {
            case 4, 6, 9, 11 -> 30;
            case 2 -> {
                boolean leap = (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
                yield leap ? 29 : 28;
            }
            default -> 31;
        };
        System.out.println("Days in month " + month + " of " + year + ": " + days);

        char op = '*';
        switch (op) {
            case '+' -> System.out.println("Addition");
            case '-' -> System.out.println("Subtraction");
            case '*' -> System.out.println("Multiplication");
            default -> System.out.println("Unknown operator");
        }
    }
}`;

const ex5 = j`public class Main {
    public static void main(String[] args) {
        int units = 250;
        double bill;

        if (units <= 100) {
            bill = units * 1.5;
        } else if (units <= 200) {
            bill = 100 * 1.5 + (units - 100) * 2.5;
        } else {
            bill = 100 * 1.5 + 100 * 2.5 + (units - 200) * 4.0;
        }

        String category = bill > 500 ? "High usage" : "Normal usage";
        System.out.println("Units consumed: " + units);
        System.out.println("Bill amount   : Rs. " + bill);
        System.out.println("Category      : " + category);
    }
}`;

export default {
  id: 'day-08-conditional-statements-switch',
  title: 'Conditional Statements: if, if-else, else-if ladder, switch, enhanced switch',
  module: 'Module 1: Java Basics',
  day: 8,
  level: 'Beginner',
  duration: '2.5 hours',
  summary: 'Teach programs to make decisions using if, if-else, nested if, the else-if ladder, the classic switch with fall-through, and the modern arrow-style switch expression with yield.',
  objectives: [
    'Write if, if-else and nested if statements correctly',
    'Build else-if ladders for range-based decisions like grades and slabs',
    'Use the classic switch statement and explain break and fall-through',
    'Use the enhanced switch (arrow labels, multiple labels, switch expressions, yield)',
    'Choose between if-else, switch and the ternary operator',
  ],
  theory: [
    {
      heading: 'Decision Making and the if Statement',
      content: j`By default, Java executes statements top to bottom. Conditional statements let the program choose a path, just like a traffic signal: if the light is green, go; otherwise, stop.

if (condition) {
    // runs only when condition is true
}

The condition MUST be a boolean expression. Unlike C, if (1) or if (x = 5) does not compile for int x.

Braces { } are optional for a single statement, but always use them; forgetting them is a classic bug:
if (marks > 40)
    System.out.println("Pass");
    System.out.println("Congrats");   // ALWAYS runs - not part of the if!`,
    },
    {
      heading: 'if-else and Nested if',
      content: j`if-else gives two paths: one when the condition is true, the other when it is false. Exactly one block runs.

if (age >= 18) {
    System.out.println("Adult");
} else {
    System.out.println("Minor");
}

Nested if: an if inside another if, used when a second check only makes sense after the first passes (age >= 18, then check licence).

Flow diagram:
        [condition?]
         /       \
      true       false
       |           |
   if-block    else-block
         \       /
        next statement

Dangling else: an else always belongs to the nearest unmatched if. Use braces to avoid confusion.`,
    },
    {
      heading: 'else-if Ladder',
      content: j`Used when there are many mutually exclusive ranges or conditions. Java checks them from top to bottom and executes ONLY the first true block; the rest are skipped.

if (marks >= 90)      grade = 'A';
else if (marks >= 75) grade = 'B';
else if (marks >= 60) grade = 'C';
else                  grade = 'F';

Order matters! If you check marks >= 40 first, a 95 would get the wrong grade. Always go from the most specific/highest to the lowest.

Analogy: a lift going down floor by floor - it stops at the first floor where someone is waiting.`,
      tip: 'Validate invalid input (like negative marks) at the top of the ladder so the rest of the logic stays clean.',
    },
    {
      heading: 'The Classic switch Statement',
      content: j`switch compares one value against many constant cases. It is cleaner than a long else-if chain when you check equality.

switch (expression) {
    case value1:
        statements;
        break;
    case value2:
        statements;
        break;
    default:
        statements;
}

Rules:
- Allowed types: byte, short, char, int, their wrappers, String (Java 7+), enum. (Java 21 also allows any object with pattern matching.) NOT long, float, double or boolean.
- Case labels must be compile-time constants and unique.
- break exits the switch. Without break, execution FALLS THROUGH into the next case(s) until a break or the end.
- default runs when no case matches; it is optional and can be placed anywhere.
- switch on a null String throws NullPointerException.

Fall-through is useful to group cases: case "Pune": case "Mumbai": ... shares one block.`,
    },
    {
      heading: 'Enhanced switch (Java 14+): Arrow Labels and Switch Expressions',
      content: j`Modern Java adds a safer switch:

1. Arrow labels case X -> ... : no fall-through, no break needed.
2. Multiple labels: case "SAT", "SUN" -> ...
3. Switch EXPRESSION: the switch returns a value that can be assigned.
4. yield returns a value from a block inside a switch expression.
5. A switch expression must be exhaustive (cover all values, usually with default).

String type = switch (day) {
    case "SAT", "SUN" -> "Weekend";
    default -> "Weekday";
};

Java 21 pattern matching for switch:
String desc = switch (obj) {
    case Integer i when i > 0 -> "positive int";
    case String s -> "string of length " + s.length();
    default -> "something else";
};`,
      syntax: j`int result = switch (x) {
    case 1 -> 10;
    case 2, 3 -> 20;
    default -> {
        int temp = x * 2;
        yield temp;
    }
};`,
    },
    {
      heading: 'Choosing the Right Construct',
      content: j`Use the simplest tool that fits:`,
      points: [
        'One condition, two outcomes, returning a value -> ternary operator',
        'Ranges (>=, <) or complex boolean conditions -> if / else-if ladder',
        'Equality against many fixed values (menu choice, day name, enum) -> switch',
        'Need a value out of a switch -> switch expression with -> and yield',
        'Prefer arrow switch in new code to avoid accidental fall-through bugs',
      ],
    },
  ],
  examples: [
    {
      title: 'if, if-else and nested if',
      scenario: 'Check whether a number is negative and odd/even, then decide if a person can drive.',
      steps: [
        'Create class Main in IntelliJ or Eclipse',
        'Write the three decision blocks',
        'Run, then change num and hasLicence to test other paths',
      ],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `-7 is a negative number
-7 is odd
Apply for a driving licence first`,
      explanation: '-7 < 0 is true. -7 % 2 is -1 (not 0), so the else branch prints odd. age 19 >= 18 is true, so we enter the nested if; hasLicence is false, so the inner else runs.',
    },
    {
      title: 'Grade calculator with else-if ladder',
      scenario: 'Read marks from the keyboard and assign a grade A to F.',
      steps: [
        'Add import java.util.Scanner;',
        'Write the ladder from highest to lowest grade, with validation first',
        'Run and type 82 in the console, press Enter',
      ],
      code: ex2,
      java: { files: { 'Main.java': ex2 }, stdin: '82\n' },
      result: `Enter marks (0-100):
Marks: 82, Grade: B`,
      explanation: '82 is valid, not >= 90, but >= 75, so grade = B and the remaining conditions are skipped. return inside main ends the program early for invalid marks.',
    },
    {
      title: 'Classic switch, fall-through and String switch',
      scenario: 'Print the day name, unlock game levels using intentional fall-through, and map a city to its state.',
      steps: [
        'Type the three switch blocks',
        'Predict what level = 2 prints before running',
        'Run and verify the fall-through behaviour',
      ],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Wednesday
Level 2 unlocked
Level 3 unlocked
Mumbai is in Maharashtra`,
      explanation: 'day 3 matches case 3 and break stops. For level 2, execution starts at case 2 and, with no break, falls into case 3, which has a break. "Mumbai" matches the grouped case "Pune": case "Mumbai": block.',
    },
    {
      title: 'Enhanced switch expressions with yield',
      scenario: 'Classify a day, find days in a month (with leap-year logic) and name an operator using arrow syntax.',
      steps: [
        'Make sure the project uses Java 17 or 21 (IntelliJ: File > Project Structure > Language level; Eclipse: Project > Properties > Java Compiler)',
        'Type the program',
        'Run and observe there is no fall-through with ->',
      ],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `SAT is a Weekend
Days in month 2 of 2024: 29
Multiplication`,
      explanation: '"SAT" matches the second label list. For month 2 the block computes leap: 2024 % 4 == 0 and 2024 % 100 != 0, so leap is true and yield returns 29. The char switch uses arrows, so only "Multiplication" prints.',
    },
    {
      title: 'Electricity bill with slab rates',
      scenario: 'A power company charges Rs. 1.5/unit for the first 100 units, Rs. 2.5 for the next 100 and Rs. 4 above 200. Compute the bill for 250 units.',
      steps: [
        'Write the else-if ladder for the three slabs',
        'Use a ternary to label the usage category',
        'Run and verify the calculation by hand',
      ],
      code: ex5,
      java: { files: { 'Main.java': ex5 } },
      result: `Units consumed: 250
Bill amount   : Rs. 600.0
Category      : High usage`,
      explanation: '250 > 200 so the last branch runs: 100 * 1.5 = 150.0, 100 * 2.5 = 250.0, (250 - 200) * 4.0 = 200.0. Total = 600.0, which is > 500, so "High usage".',
    },
  ],
  interview: [
    { q: 'Which data types are allowed in a switch?', a: 'byte, short, char, int and their wrappers, String, enum. From Java 21, pattern matching allows any reference type. long, float, double and boolean are not allowed.', level: 'Easy' },
    { q: 'What is fall-through in switch?', a: 'If a case has no break, execution continues into the following cases until a break or the end of the switch.', level: 'Easy' },
    { q: 'What is the difference between a switch statement and a switch expression?', a: 'A switch expression produces a value (e.g. assigned to a variable), uses -> or yield, has no fall-through with arrows and must be exhaustive.', level: 'Medium' },
    { q: 'What is yield?', a: 'yield returns a value from a block inside a switch expression, e.g. case 2 -> { ... yield 29; }.', level: 'Medium' },
    { q: 'What is the output: int x = 5; if (x > 2) if (x > 10) System.out.println("A"); else System.out.println("B");', a: 'B. The else belongs to the nearest if (x > 10), which is false.', level: 'Medium' },
    { q: 'Will if (x = 5) compile when x is int?', a: 'No. x = 5 is an int, but if needs a boolean. (It compiles only when x is boolean, e.g. if (flag = true), which is a bug.)', level: 'Medium' },
    { q: 'What happens if you switch on a null String?', a: 'NullPointerException is thrown (unless Java 21 pattern switch with case null is used).', level: 'Hard' },
    { q: 'Can we have duplicate case labels?', a: 'No, case labels must be unique compile-time constants; duplicates cause a compile error.', level: 'Easy' },
    { q: 'What is the output: int k = 1; switch (k) { case 1: System.out.print("1"); case 2: System.out.print("2"); default: System.out.print("D"); }', a: '12D. No breaks, so it falls through case 2 and default.', level: 'Medium' },
    { q: 'Is default mandatory in a switch?', a: 'In a switch statement it is optional. In a switch expression, cases must be exhaustive, so default is required unless all enum/sealed values are covered.', level: 'Medium' },
    { q: 'if-else vs switch: which is faster?', a: 'For many equality checks, switch can be compiled to a jump table (tableswitch/lookupswitch), which can be faster and is more readable. For ranges, if-else is required.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Find the largest of three numbers using an else-if ladder.',
      hint: 'Check a >= b && a >= c first, then b >= c.',
      solution: j`public class Main {
    public static void main(String[] args) {
        int a = 14, b = 29, c = 7;
        if (a >= b && a >= c) {
            System.out.println("Largest: " + a);
        } else if (b >= c) {
            System.out.println("Largest: " + b);
        } else {
            System.out.println("Largest: " + c);
        }
    }
}`,
    },
    {
      task: 'Write a menu-driven calculator: read two numbers and a choice 1-4 and perform +, -, *, / using a switch expression.',
      hint: 'double r = switch (choice) { case 1 -> a + b; ... default -> 0; };',
      solution: j`import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Enter two numbers:");
        double a = sc.nextDouble();
        double b = sc.nextDouble();
        System.out.println("1.Add 2.Subtract 3.Multiply 4.Divide");
        int choice = sc.nextInt();
        double r = switch (choice) {
            case 1 -> a + b;
            case 2 -> a - b;
            case 3 -> a * b;
            case 4 -> a / b;
            default -> {
                System.out.println("Invalid choice");
                yield 0;
            }
        };
        System.out.println("Result: " + r);
    }
}`,
    },
    {
      task: 'Check whether an entered character is a vowel, consonant, digit or special character.',
      hint: 'Use Character.isLetter, Character.isDigit and a switch for vowels.',
      solution: j`import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Enter a character:");
        char ch = Character.toLowerCase(sc.next().charAt(0));
        if (Character.isDigit(ch)) {
            System.out.println("Digit");
        } else if (Character.isLetter(ch)) {
            switch (ch) {
                case 'a', 'e', 'i', 'o', 'u' -> System.out.println("Vowel");
                default -> System.out.println("Consonant");
            }
        } else {
            System.out.println("Special character");
        }
    }
}`,
    },
    {
      task: 'Income tax calculator: no tax up to 3,00,000; 5% on 3,00,001-7,00,000; 10% on 7,00,001-10,00,000; 20% above. Compute tax for 12,00,000.',
      hint: 'Calculate slab by slab like the electricity bill.',
      solution: j`public class Main {
    public static void main(String[] args) {
        double income = 1200000;
        double tax = 0;
        if (income > 1000000) {
            tax = (income - 1000000) * 0.20 + 300000 * 0.10 + 400000 * 0.05;
        } else if (income > 700000) {
            tax = (income - 700000) * 0.10 + 400000 * 0.05;
        } else if (income > 300000) {
            tax = (income - 300000) * 0.05;
        }
        System.out.println("Tax: " + tax);
    }
}`,
    },
    {
      task: 'Print the season for a month number 1-12 using an enhanced switch with multiple labels.',
      hint: 'case 12, 1, 2 -> "Winter";',
      solution: j`public class Main {
    public static void main(String[] args) {
        int month = 7;
        String season = switch (month) {
            case 12, 1, 2 -> "Winter";
            case 3, 4, 5 -> "Summer";
            case 6, 7, 8, 9 -> "Monsoon";
            case 10, 11 -> "Autumn";
            default -> "Invalid month";
        };
        System.out.println("Month " + month + ": " + season);
    }
}`,
    },
  ],
  quiz: [
    { question: 'Which type CANNOT be used in a switch?', options: ['String', 'char', 'long', 'enum'], answer: 2, explanation: 'long, float, double and boolean are not allowed as switch selector types.' },
    { question: 'In an else-if ladder, how many blocks execute at most?', options: ['All true blocks', 'Exactly one (or none if no else)', 'Two', 'Depends on breaks'], answer: 1, explanation: 'Only the first true condition block runs; the rest are skipped.' },
    { question: 'Which keyword returns a value from a block in a switch expression?', options: ['return', 'break', 'continue', 'yield'], answer: 3, explanation: 'yield provides the value of a block in a switch expression.' },
    { question: 'What prints? int n = 2; switch (n) { case 1 -> System.out.print("A"); case 2 -> System.out.print("B"); case 3 -> System.out.print("C"); }', options: ['B', 'BC', 'ABC', 'Compile error'], answer: 0, explanation: 'Arrow labels never fall through.' },
    { question: 'What prints? int x = 10; if (x > 5) { System.out.print("X"); } else if (x > 8) { System.out.print("Y"); } else { System.out.print("Z"); }', options: ['X', 'XY', 'Y', 'Z'], answer: 0, explanation: 'The first true condition wins; the else-if is skipped even though it is also true.' },
  ],
};
