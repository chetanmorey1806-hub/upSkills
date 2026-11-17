export default {
  id: "day-07-conditional-statements",
  title: "Conditional Statements: if, elif, else, Nested if, match-case",
  module: "Module 1: Python Basics",
  day: 7,
  level: "Beginner",
  duration: "2 hours",
  summary: "Make decisions in programs with if, if-else, if-elif-else ladders, nested if, the one-line conditional expression, and the structural pattern matching statement match-case (Python 3.10+).",
  objectives: [
    "Write if, if-else and if-elif-else statements with correct indentation",
    "Use nested if and combine conditions with and/or/not",
    "Use the ternary (conditional) expression for short decisions",
    "Write match-case with literals, OR patterns, guards, sequence and wildcard patterns",
    "Avoid common mistakes like = vs ==, wrong order of elif, and missing else",
  ],
  theory: [
    {
      heading: "The if statement",
      content: "An if statement runs a block only when a condition is True. Think of a security guard: \"if you have an ID card, you may enter\". The condition can be any expression; Python checks its truthiness. The line ends with a colon and the block is indented.",
      syntax: `if condition:
    statement(s)          # runs only when condition is truthy

if marks >= 35:
    print("Pass")`,
      points: [
        "if items: is the Pythonic way to check a non-empty list",
        "if x == 5 compares; if x = 5 is a SyntaxError",
      ],
    },
    {
      heading: "if-else and if-elif-else ladder",
      content: "else gives an alternative block when the condition is False. When there are more than two choices, use elif (else if). Python checks conditions from top to bottom and runs ONLY the first block whose condition is True; the rest are skipped. So the order of elif conditions matters: put the most specific (or highest) first.",
      syntax: `if marks >= 90:
    grade = "A"
elif marks >= 75:
    grade = "B"
elif marks >= 50:
    grade = "C"
else:
    grade = "F"`,
      tip: "If you write \"elif marks >= 50\" before \"elif marks >= 75\", a student with 80 gets C. Always order from the strictest condition to the loosest.",
    },
    {
      heading: "Nested if",
      content: "An if inside another if is called nested if. Use it when the second question only makes sense after the first answer, like an ATM: first check the PIN, and only if it is correct, check the balance. Too much nesting makes code hard to read; often you can flatten it with and, or with early exits.",
      syntax: `if pin_ok:
    if amount <= balance:
        print("Collect cash")
    else:
        print("Insufficient balance")
else:
    print("Wrong PIN")`,
    },
    {
      heading: "Conditional (ternary) expression and pass",
      content: "For a simple two-way choice that produces a value, Python has a one-line conditional expression: value_if_true if condition else value_if_false. It is an expression, so you can use it inside print() or an assignment. If a block is required by syntax but you have nothing to write yet, use pass (a do-nothing statement).",
      syntax: `status = "Adult" if age >= 18 else "Minor"
print("Even" if n % 2 == 0 else "Odd")

if age < 0:
    pass   # TODO: handle later`,
    },
    {
      heading: "match-case (structural pattern matching, Python 3.10+)",
      content: "match-case compares one value against several patterns, similar to switch-case in Java/C but more powerful. The first matching case runs; there is no fall-through and no break needed. case _ is the wildcard (default). You can combine values with |, add a guard with if, capture values into variables, and match the shape of lists, tuples and dicts.",
      syntax: `match command:
    case "start":
        ...
    case "stop" | "quit":            # OR pattern
        ...
    case _:                          # default
        ...

match point:
    case (0, 0):          print("Origin")
    case (x, 0):          print(f"On X axis at {x}")
    case (x, y) if x == y: print("On diagonal")   # guard
    case (x, y):          print(f"Point {x},{y}")`,
      points: [
        "Requires Python 3.10 or newer",
        "Plain names in a case capture values; to compare with a constant use a dotted name (Color.RED) or a literal",
      ],
    },
  ],
  examples: [
    {
      title: "Grade calculator with if-elif-else",
      scenario: "A college converts marks into grades. Read marks and print the grade, and reject invalid marks.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `marks = int(input("Enter marks (0-100): "))
if marks < 0 or marks > 100:
    print("Invalid marks")
elif marks >= 90:
    print("Grade A+ (Outstanding)")
elif marks >= 75:
    print("Grade A (Distinction)")
elif marks >= 60:
    print("Grade B (First class)")
elif marks >= 35:
    print("Grade C (Pass)")
else:
    print("Grade F (Fail)")`,
      python: {
        files: {
          "main.py": `marks = int(input("Enter marks (0-100): "))
if marks < 0 or marks > 100:
    print("Invalid marks")
elif marks >= 90:
    print("Grade A+ (Outstanding)")
elif marks >= 75:
    print("Grade A (Distinction)")
elif marks >= 60:
    print("Grade B (First class)")
elif marks >= 35:
    print("Grade C (Pass)")
else:
    print("Grade F (Fail)")`,
        },
        stdin: `82
`,
      },
      result: `Enter marks (0-100): Grade A (Distinction)`,
      explanation: "Python checks conditions from top to bottom. 82 is not invalid, not >= 90, but is >= 75, so it prints Grade A and skips all remaining branches.",
    },
    {
      title: "Nested if: ATM withdrawal",
      scenario: "Check the PIN first; only then check amount rules (multiple of 100, enough balance).",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `balance = 5000
correct_pin = 1234

pin = int(input("PIN: "))
amount = int(input("Amount: "))
print()
if pin == correct_pin:
    if amount % 100 != 0:
        print("Amount must be a multiple of 100")
    elif amount > balance:
        print("Insufficient balance")
    else:
        balance -= amount
        print(f"Please collect Rs.{amount}. Balance: Rs.{balance}")
else:
    print("Wrong PIN")`,
      python: {
        files: {
          "main.py": `balance = 5000
correct_pin = 1234

pin = int(input("PIN: "))
amount = int(input("Amount: "))
print()
if pin == correct_pin:
    if amount % 100 != 0:
        print("Amount must be a multiple of 100")
    elif amount > balance:
        print("Insufficient balance")
    else:
        balance -= amount
        print(f"Please collect Rs.{amount}. Balance: Rs.{balance}")
else:
    print("Wrong PIN")`,
        },
        stdin: `1234
1500
`,
      },
      result: `PIN: Amount: 
Please collect Rs.1500. Balance: Rs.3500`,
      explanation: "The inner if-elif-else runs only after the PIN check passes. Change the inputs to a wrong PIN or 1550 to see the other branches.",
    },
    {
      title: "Largest of three numbers and ternary expression",
      scenario: "A classic program: find the largest of three numbers with if-elif, then use one-line conditional expressions.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `a, b, c = 45, 78, 62
if a >= b and a >= c:
    largest = a
elif b >= c:
    largest = b
else:
    largest = c
print("Largest:", largest)

n = 7
print(n, "is", "even" if n % 2 == 0 else "odd")
age = 16
print("Ticket:", "Adult Rs.200" if age >= 18 else "Child Rs.100")
num = -3
print("Sign:", "positive" if num > 0 else "zero" if num == 0 else "negative")`,
      python: {
        files: {
          "main.py": `a, b, c = 45, 78, 62
if a >= b and a >= c:
    largest = a
elif b >= c:
    largest = b
else:
    largest = c
print("Largest:", largest)

n = 7
print(n, "is", "even" if n % 2 == 0 else "odd")
age = 16
print("Ticket:", "Adult Rs.200" if age >= 18 else "Child Rs.100")
num = -3
print("Sign:", "positive" if num > 0 else "zero" if num == 0 else "negative")`,
        },
      },
      result: `Largest: 78
7 is odd
Ticket: Child Rs.100
Sign: negative`,
      explanation: "If a is not the largest, the elif only needs to compare b and c. Conditional expressions can be chained, but keep them short; more than two levels hurts readability.",
    },
    {
      title: "Leap year and triangle validation",
      scenario: "Combine conditions with and/or for real rules: leap years and checking whether three sides form a triangle.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `for year in [1900, 2000, 2024, 2026]:
    if (year % 4 == 0 and year % 100 != 0) or year % 400 == 0:
        print(year, "is a leap year")
    else:
        print(year, "is not a leap year")

a, b, c = 3, 4, 5
if a + b > c and b + c > a and a + c > b:
    if a == b == c:
        kind = "Equilateral"
    elif a == b or b == c or a == c:
        kind = "Isosceles"
    else:
        kind = "Scalene"
    print("Valid triangle:", kind)
else:
    print("Not a triangle")`,
      python: {
        files: {
          "main.py": `for year in [1900, 2000, 2024, 2026]:
    if (year % 4 == 0 and year % 100 != 0) or year % 400 == 0:
        print(year, "is a leap year")
    else:
        print(year, "is not a leap year")

a, b, c = 3, 4, 5
if a + b > c and b + c > a and a + c > b:
    if a == b == c:
        kind = "Equilateral"
    elif a == b or b == c or a == c:
        kind = "Isosceles"
    else:
        kind = "Scalene"
    print("Valid triangle:", kind)
else:
    print("Not a triangle")`,
        },
      },
      result: `1900 is not a leap year
2000 is a leap year
2024 is a leap year
2026 is not a leap year
Valid triangle: Scalene`,
      explanation: "A year is leap if divisible by 4 but not by 100, unless divisible by 400. 1900 is not leap, 2000 is. For triangles every pair of sides must be greater than the third.",
    },
    {
      title: "match-case: menu commands and HTTP status",
      scenario: "A command-line app reads commands; a web client maps HTTP status codes to messages. match-case keeps it clean.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `def handle(command):
    match command.split():
        case ["add", item]:
            return f"Adding {item}"
        case ["remove", item] | ["delete", item]:
            return f"Removing {item}"
        case ["list"]:
            return "Listing all items"
        case ["quit" | "exit"]:
            return "Goodbye"
        case _:
            return f"Unknown command: {command}"

for cmd in ["add milk", "delete eggs", "list", "exit", "fly away"]:
    print(handle(cmd))

def http_message(code):
    match code:
        case 200 | 201:
            return "Success"
        case 404:
            return "Not Found"
        case c if 500 <= c < 600:
            return "Server Error"
        case _:
            return "Other"

print([http_message(c) for c in (200, 404, 503, 302)])`,
      python: {
        files: {
          "main.py": `def handle(command):
    match command.split():
        case ["add", item]:
            return f"Adding {item}"
        case ["remove", item] | ["delete", item]:
            return f"Removing {item}"
        case ["list"]:
            return "Listing all items"
        case ["quit" | "exit"]:
            return "Goodbye"
        case _:
            return f"Unknown command: {command}"

for cmd in ["add milk", "delete eggs", "list", "exit", "fly away"]:
    print(handle(cmd))

def http_message(code):
    match code:
        case 200 | 201:
            return "Success"
        case 404:
            return "Not Found"
        case c if 500 <= c < 600:
            return "Server Error"
        case _:
            return "Other"

print([http_message(c) for c in (200, 404, 503, 302)])`,
        },
      },
      result: `Adding milk
Removing eggs
Listing all items
Goodbye
Unknown command: fly away
['Success', 'Not Found', 'Server Error', 'Other']`,
      explanation: "command.split() creates a list, and list patterns like [\"add\", item] match both the length and the first word, capturing the second word into item. | means OR. The guard \"if 500 <= c < 600\" adds an extra condition. case _ is the default.",
    },
  ],
  interview: [
    {
      q: "What is the difference between if-elif-else and multiple if statements?",
      a: "In an if-elif-else ladder only the first True branch runs and the rest are skipped. With separate if statements every condition is checked and several blocks can run.",
      level: "Easy",
    },
    {
      q: "Does Python have a switch statement?",
      a: "Not a classic switch, but Python 3.10 added match-case (structural pattern matching), which supports literals, OR patterns, guards, captures and sequence/mapping patterns. Before 3.10, people used if-elif or dict lookups.",
      level: "Medium",
    },
    {
      q: "What is the ternary operator in Python?",
      a: "The conditional expression: x if condition else y. Example: \"Even\" if n % 2 == 0 else \"Odd\".",
      level: "Easy",
    },
    {
      q: "What is the use of pass?",
      a: "pass is a null statement used where syntax needs a block but no action is required, e.g. an empty if/function/class placeholder.",
      level: "Easy",
    },
    {
      q: `What is the output?
x = 0
if x:
    print("A")
elif x == 0:
    print("B")
else:
    print("C")`,
      a: "B. 0 is falsy so the first branch is skipped, and x == 0 is True.",
      level: "Easy",
    },
    {
      q: "What is the output of print(\"Yes\" if [] else \"No\")?",
      a: "No, because an empty list is falsy.",
      level: "Easy",
    },
    {
      q: "What does case _ mean in match-case?",
      a: "It is the wildcard pattern that matches anything and does not bind a variable; it acts as the default branch.",
      level: "Medium",
    },
    {
      q: "Is there fall-through in match-case?",
      a: "No. Only the first matching case runs; there is no need for break.",
      level: "Medium",
    },
    {
      q: "Why is \"if x == True\" considered bad style?",
      a: "It is redundant and fails for truthy non-bool values. Write \"if x:\". For None checks use \"if x is None\".",
      level: "Medium",
    },
    {
      q: "How can you avoid deeply nested if statements?",
      a: "Combine conditions with and/or, use elif, use early return/continue (guard clauses), or use dictionary dispatch / match-case.",
      level: "Hard",
    },
  ],
  practice: [
    {
      task: "Read a number and print whether it is positive, negative or zero.",
      hint: "if-elif-else",
      solution: `n = float(input())
if n > 0:
    print("Positive")
elif n < 0:
    print("Negative")
else:
    print("Zero")`,
    },
    {
      task: "Electricity bill: first 100 units Rs.5/unit, next 100 Rs.7/unit, above 200 Rs.10/unit. Read units, print the bill.",
      hint: "Calculate slab by slab.",
      solution: `u = int(input())
if u <= 100:
    bill = u * 5
elif u <= 200:
    bill = 100 * 5 + (u - 100) * 7
else:
    bill = 100 * 5 + 100 * 7 + (u - 200) * 10
print("Bill:", bill)`,
    },
    {
      task: "Read a day number 1-7 and print the day name using match-case.",
      hint: "case 1: ... case _:",
      solution: `d = int(input())
match d:
    case 1: print("Monday")
    case 2: print("Tuesday")
    case 3: print("Wednesday")
    case 4: print("Thursday")
    case 5: print("Friday")
    case 6 | 7: print("Weekend")
    case _: print("Invalid day")`,
    },
    {
      task: "Read a character and print whether it is an uppercase letter, lowercase letter, digit or special character.",
      hint: "isupper(), islower(), isdigit()",
      solution: `ch = input()[0]
if ch.isupper():
    print("Uppercase")
elif ch.islower():
    print("Lowercase")
elif ch.isdigit():
    print("Digit")
else:
    print("Special character")`,
    },
  ],
  quiz: [
    {
      question: "Which keyword means \"else if\" in Python?",
      options: [
        "elseif",
        "else if",
        "elif",
        "elsif",
      ],
      answer: 2,
      explanation: "Python uses elif.",
    },
    {
      question: "What prints? x = 15; print(\"A\" if x > 10 else \"B\")",
      options: [
        "A",
        "B",
        "AB",
        "Error",
      ],
      answer: 0,
      explanation: "15 > 10 is True.",
    },
    {
      question: "In match-case, which pattern acts as default?",
      options: [
        "default:",
        "case else:",
        "case *:",
        "case _:",
      ],
      answer: 3,
      explanation: "The wildcard _ matches anything.",
    },
    {
      question: "Minimum Python version for match-case?",
      options: [
        "3.10",
        "3.6",
        "3.8",
        "2.7",
      ],
      answer: 0,
      explanation: "Structural pattern matching arrived in 3.10.",
    },
    {
      question: "With marks = 80, what does this print? if marks >= 50: print(\"C\") elif marks >= 75: print(\"B\")",
      options: [
        "B",
        "C",
        "B and C",
        "Nothing",
      ],
      answer: 1,
      explanation: "The first True branch (>= 50) runs and the rest is skipped. The order is wrong.",
    },
  ],
};
