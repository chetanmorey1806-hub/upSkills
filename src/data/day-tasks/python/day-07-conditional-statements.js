export default {
  lesson: 'day-07-conditional-statements',
  minutes: 25,
  intro: 'Write if / elif / else ladders, nested conditions, the ternary expression and match-case for real decisions.',
  tasks: [
    {
      type: 'output',
      mins: 2,
      q: 'The order of `elif` matters. What is printed?',
      code: `marks = 85
if marks >= 40:
    print("C")
elif marks >= 75:
    print("A")
else:
    print("Fail")
print("checked")`,
      expected: 'C\nchecked',
      explain: 'Python checks conditions **top to bottom** and runs only the **first** true branch. 85 >= 40 is true, so it prints C and skips the rest. Always put the strictest condition (>= 75) first.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the **ternary** (conditional) expression:\n```\nage = 20\nstatus = "Adult" ____ age >= 18 else "Minor"\n```',
      accept: ['if'],
      explain: 'The conditional expression is `value_if_true if condition else value_if_false`. It is perfect for short choices; use a normal if-else for longer logic.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Grade calculator. Read marks (an integer) with `input()` (no prompt) and print the grade:\n- 90 and above → `A+`\n- 75 to 89 → `A`\n- 60 to 74 → `B`\n- 40 to 59 → `C`\n- below 40 → `Fail`\n\nAlso store the grade in a variable `grade`. Test input: `76` → `A`',
      example: { title: 'if-elif-else ladder', code: 'speed = 72\nif speed > 100:\n    msg = "Too fast"\nelif speed > 60:\n    msg = "Fast"\nelse:\n    msg = "OK"\nprint(msg)' },
      stdin: '76',
      starter: `marks = int(input())
grade = ""
# TODO: if / elif / else
print(grade)`,
      solution: `marks = int(input())
if marks >= 90:
    grade = "A+"
elif marks >= 75:
    grade = "A"
elif marks >= 60:
    grade = "B"
elif marks >= 40:
    grade = "C"
else:
    grade = "Fail"
print(grade)`,
      tests: [{ stdout: 'A' }, { call: 'grade', expect: 'A' }],
      explain: 'Checking from the highest band down means each `elif` only needs the lower limit. If you start with `marks >= 40`, every passing student gets C. Remember the colon `:` after each condition.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Leap year. Read a year and print `Leap year` or `Not a leap year`.\n\nRule: divisible by 4 **and not** by 100, **or** divisible by 400.\n\nTest input: `1900` (not a leap year, even though 1900 % 4 == 0!)',
      example: { title: 'combining conditions', code: 'n = 30\nif n % 3 == 0 and not n % 5 == 0:\n    print("multiple of 3 only")\nelse:\n    print("other")' },
      stdin: '1900',
      starter: `year = int(input())
# TODO: print Leap year / Not a leap year
`,
      solution: `year = int(input())
if (year % 4 == 0 and year % 100 != 0) or year % 400 == 0:
    print("Leap year")
else:
    print("Not a leap year")`,
      tests: [{ stdout: 'Not a leap year' }],
      explain: 'Only checking `year % 4 == 0` is the classic mistake: century years like 1900 are leap years only when divisible by 400 (2000 was, 1900 was not). Brackets make the and/or grouping clear.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Chatbot menu with **match-case**. Read a command, convert it to lowercase, and print:\n- `start` → `Starting...`\n- `stop` → `Stopping...`\n- `quit` or `exit` → `Bye!` (use one OR pattern `|`)\n- anything else → `Unknown command`\n\nTest input: `EXIT` → `Bye!`',
      example: { title: 'match-case with OR and wildcard', code: 'day = "sun"\nmatch day:\n    case "sat" | "sun":\n        print("Weekend")\n    case _:\n        print("Weekday")' },
      stdin: 'EXIT',
      starter: `cmd = input().lower()
# TODO: match cmd ...
`,
      solution: `cmd = input().lower()
match cmd:
    case "start":
        print("Starting...")
    case "stop":
        print("Stopping...")
    case "quit" | "exit":
        print("Bye!")
    case _:
        print("Unknown command")`,
      tests: [{ stdout: 'Bye!' }],
      explain: '`case "quit" | "exit":` matches either value. `case _:` is the wildcard (like else). Without `.lower()`, "EXIT" would fall into the wildcard. match-case needs Python 3.10+.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What happens with `if marks = 100:`?',
      options: ['It checks if marks equals 100', 'It sets marks to 100 and runs the block', 'SyntaxError: use == for comparison', 'It is ignored'],
      answer: 2,
      explain: '`=` is **assignment** and is not allowed as an if condition; Python raises a SyntaxError (and even suggests `==`). Use `==` to compare.',
    },
  ],
};
