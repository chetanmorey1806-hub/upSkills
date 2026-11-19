export default {
  lesson: 'day-08-conditional-statements-switch',
  minutes: 20,
  intro: 'Trace if/else-if ladders, classic switch fall-through and the modern arrow switch.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What does this grade program print?',
      example: {
        title: 'only the first true branch runs',
        code: `int t = 30;
if (t > 20) System.out.println("Warm");
else if (t > 10) System.out.println("Mild"); // skipped`,
      },
      code: `public class Main {
    public static void main(String[] args) {
        int[] scores = {95, 74, 60, 33};
        for (int marks : scores) {
            if (marks >= 90) System.out.println("A");
            else if (marks >= 75) System.out.println("B");
            else if (marks >= 60) System.out.println("C");
            else if (marks >= 40) System.out.println("D");
            else System.out.println("Fail");
        }
    }
}`,
      expected: `A
C
C
Fail`,
      explain: 'An else-if ladder checks conditions **top to bottom and stops at the first true one**. 74 is not ≥ 75, so it falls to "C" (≥ 60). 60 is exactly ≥ 60, so it is "C" as well. 33 matches nothing, so the final `else` prints "Fail".',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Fall-through! What does this program print?',
      example: {
        title: 'without break, the next cases also run',
        code: `switch (1) {
  case 1: System.out.println("one");
  case 2: System.out.println("two"); break;
}
// one
// two`,
      },
      code: `public class Main {
    public static void main(String[] args) {
        int day = 2;
        switch (day) {
            case 1: System.out.println("Mon");
            case 2: System.out.println("Tue");
            case 3: System.out.println("Wed");
                break;
            case 4: System.out.println("Thu");
            default: System.out.println("Other");
        }
    }
}`,
      expected: `Tue
Wed`,
      explain: 'Execution jumps to `case 2`, prints "Tue", and because there is no `break` it **falls through** into case 3 and prints "Wed". The `break` after Wed stops the switch, so Thu and Other never run.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Complete the arrow-switch label so Saturday and Sunday both give "Weekend":
\`String type = switch (day) {\`
\`  ____ -> "Weekend";\`
\`  default -> "Weekday";\`
\`};\``,
      example: { title: 'several labels in one arrow case', code: 'case 4, 6, 9, 11 -> 30;' },
      accept: ['case "SAT", "SUN"', 'case "SUN", "SAT"'],
      acceptRegex: ['^case\\s*"SAT"\\s*,\\s*"SUN"\\s*[;{]?$', '^case\\s*"SUN"\\s*,\\s*"SAT"\\s*[;{]?$'],
      caseSensitive: true,
      explain: 'Java 14+ allows **several labels separated by commas** in one case: `case "SAT", "SUN" -> ...`. Arrow cases never fall through, so no `break` is needed, and a switch expression must be exhaustive (hence `default`).',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'In a switch **expression**, a case with a `{ }` block returns its value with which keyword?',
      example: {
        title: 'block inside an arrow case',
        code: `case 2 -> {
    boolean leap = year % 4 == 0;
    ____ leap ? 29 : 28;
}`,
      },
      accept: ['yield'],
      acceptRegex: ['^yield\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`yield value;` hands a value out of a block in a switch expression. `return` would try to leave the whole method, which is a compile error inside a switch expression.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which type can **NOT** be used as the value in a classic `switch (x)`?',
      options: ['int', 'String', 'char', 'double'],
      answer: 3,
      explain: 'switch works with `byte`, `short`, `char`, `int`, their wrappers, `String` (Java 7+) and enums. `long`, `float`, `double` and `boolean` are not allowed because exact matching of floating values is unreliable.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: `What is printed?
\`int x = 10;\`
\`if (x > 5)\`
\`    if (x > 20) System.out.println("A");\`
\`else System.out.println("B");\``,
      options: ['A', 'B', 'Nothing', 'Compile error'],
      answer: 1,
      explain: 'An `else` belongs to the **nearest unmatched if** (the "dangling else"), no matter how it is indented. So `else` pairs with `if (x > 20)`: x > 5 is true, x > 20 is false → "B". Always use braces to avoid confusion.',
    },
  ],
};
