export default {
  id: "day-05-type-conversion-input-formatting",
  title: "Type Conversion, input() and Formatted Output (f-strings, format())",
  module: "Module 1: Python Basics",
  day: 5,
  level: "Beginner",
  duration: "2 hours",
  summary: "Convert values between types (implicit and explicit casting), read user input with input(), and produce clean, professional output using f-strings, str.format() and format specifiers.",
  objectives: [
    "Differentiate implicit and explicit type conversion",
    "Use int(), float(), str(), bool(), complex() and handle invalid conversions",
    "Read text and numbers from the user with input() and split()",
    "Format output with f-strings: width, alignment, decimals, commas, percentages",
    "Use str.format() and know the old % formatting for reading legacy code",
  ],
  theory: [
    {
      heading: "Implicit type conversion (automatic)",
      content: "Implicit conversion (type coercion) is done by Python automatically when it is safe and no data is lost. When you mix int and float in an expression, Python converts the int to float. bool is converted to int. Python never implicitly converts between str and numbers, because that could hide bugs.",
      syntax: `10 + 2.5      # int + float -> 12.5 (float)
True + 5      # bool + int  -> 6 (int)
3 + 2j + 1.0  # -> (4+2j) complex
"10" + 5      # TypeError (no implicit str<->int)`,
      points: [
        "Order of \"widening\": bool -> int -> float -> complex",
      ],
    },
    {
      heading: "Explicit type conversion (type casting)",
      content: "Explicit conversion is when YOU convert a value using a constructor function. The most common use is converting the text returned by input() into a number. If the text is not a valid number, Python raises ValueError.",
      syntax: `int("25")        # 25
int(9.99)        # 9  (truncates toward zero, does NOT round)
int("1010", 2)   # 10 (from binary string)
float("3.5")     # 3.5
float(7)         # 7.0
str(100)         # '100'
bool(0)          # False, bool("False") -> True (non-empty string!)
complex(2, 3)    # (2+3j)
int("12.5")      # ValueError - use int(float("12.5"))
round(2.675, 2)  # 2.67 (float precision), round(3.5) -> 4, round(2.5) -> 2 (banker's rounding)`,
      tip: "bool(\"False\") is True because any non-empty string is truthy. A frequent trick question!",
    },
    {
      heading: "Reading input with input()",
      content: "input(prompt) displays the prompt, waits for the user to type and press Enter, and ALWAYS returns a str (without the newline). To get numbers, wrap it in int() or float(). To read several values on one line, use split(), which breaks the text at spaces, and map() to convert each part.",
      syntax: `name = input("Enter name: ")            # str
age = int(input("Enter age: "))          # int
price = float(input("Enter price: "))    # float
a, b = input("Two numbers: ").split()    # two strs
x, y = map(int, input().split())         # two ints
nums = list(map(int, input().split()))   # list of ints
city = input().strip()                   # remove extra spaces`,
      points: [
        "Common mistake: age = input(); age + 1 -> TypeError, because age is a string",
        "split(\",\") splits on commas instead of spaces",
      ],
    },
    {
      heading: "f-strings (formatted string literals)",
      content: "f-strings (Python 3.6+) are the modern and fastest way to build strings. Put f before the quotes and write any expression inside { }. After a colon you can give a format specification: width, alignment, decimals, separators. Python 3.8+ also supports {var=} for debugging, which prints the name and the value.",
      syntax: `name, marks = "Asha", 87.456
f"Hello {name}"                 # Hello Asha
f"{marks:.2f}"                  # 87.46   (2 decimals)
f"{1234567:,}"                  # 1,234,567
f"{0.256:.1%}"                  # 25.6%
f"{name:>10}"                   # right align in 10 chars
f"{name:<10}|"                  # left align
f"{name:^10}"                   # center
f"{name:*^10}"                  # fill with *
f"{42:05d}"                     # 00042 (zero padding)
f"{255:b} {255:x} {255:o}"      # binary hex octal
f"{marks=}"                     # marks=87.456
f"{{literal braces}}"           # {literal braces}`,
    },
    {
      heading: "str.format() and % formatting",
      content: "Before f-strings, programmers used str.format() with {} placeholders, filled by position or by name. It is still useful when the template string is stored separately (for example in a config). The oldest style uses % like C's printf; you will see it in legacy code and in the logging module.",
      syntax: `"Hello {}, you are {}".format("Ravi", 22)
"{1} before {0}".format("A", "B")           # B before A
"{name} scored {score:.1f}".format(name="Ravi", score=91.25)
"%s is %d years and %.2f m" % ("Ravi", 22, 1.756)`,
      points: [
        "%s string, %d integer, %f float, %.2f float with 2 decimals",
      ],
    },
  ],
  examples: [
    {
      title: "Simple interest calculator with input()",
      scenario: "A bank clerk enters principal, rate and time. Convert the inputs and display the interest with 2 decimals.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `principal = float(input("Principal amount: "))
rate = float(input("Rate of interest (%): "))
years = int(input("Time (years): "))

interest = principal * rate * years / 100
total = principal + interest
print()
print(f"Simple Interest : {interest:,.2f}")
print(f"Total Amount    : {total:,.2f}")`,
      python: {
        files: {
          "main.py": `principal = float(input("Principal amount: "))
rate = float(input("Rate of interest (%): "))
years = int(input("Time (years): "))

interest = principal * rate * years / 100
total = principal + interest
print()
print(f"Simple Interest : {interest:,.2f}")
print(f"Total Amount    : {total:,.2f}")`,
        },
        stdin: `150000
7.5
3
`,
      },
      result: `Principal amount: Rate of interest (%): Time (years): 
Simple Interest : 33,750.00
Total Amount    : 183,750.00`,
      explanation: "Each input() returns a string, so we convert with float() and int(). The format :,.2f adds thousands separators and 2 decimals. The captured output shows the prompts on one line because the typed values are not part of the program output.",
    },
    {
      title: "Reading multiple values on one line",
      scenario: "Competitive programming style: the first line has two numbers, the second line has a list of marks.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `a, b = map(int, input().split())
marks = list(map(int, input().split()))
print("a + b =", a + b)
print("marks:", marks)
print("count:", len(marks), "| average:", round(sum(marks) / len(marks), 2))`,
      python: {
        files: {
          "main.py": `a, b = map(int, input().split())
marks = list(map(int, input().split()))
print("a + b =", a + b)
print("marks:", marks)
print("count:", len(marks), "| average:", round(sum(marks) / len(marks), 2))`,
        },
        stdin: `12 30
78 91 66 85
`,
      },
      result: `a + b = 42
marks: [78, 91, 66, 85]
count: 4 | average: 80.0`,
      explanation: "input().split() breaks \"12 30\" into [\"12\", \"30\"]; map(int, ...) converts each to int; the two values are unpacked into a and b. list(map(...)) converts a whole line into a list of ints.",
    },
    {
      title: "Explicit conversion and its traps",
      scenario: "See what each conversion function does, including truncation, binary strings and the bool(\"False\") trap, and handle a ValueError.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `print(int(9.99), int(-9.99))
print(int("0b101", 0), int("ff", 16))
print(float("1e3"), str(3.0), complex("2+3j"))
print(bool("False"), bool(""), bool(0.0))
print(round(3.5), round(2.5), round(2.675, 2))

text = "12.5"
try:
    print(int(text))
except ValueError as e:
    print("ValueError:", e)
print("Fixed:", int(float(text)))`,
      python: {
        files: {
          "main.py": `print(int(9.99), int(-9.99))
print(int("0b101", 0), int("ff", 16))
print(float("1e3"), str(3.0), complex("2+3j"))
print(bool("False"), bool(""), bool(0.0))
print(round(3.5), round(2.5), round(2.675, 2))

text = "12.5"
try:
    print(int(text))
except ValueError as e:
    print("ValueError:", e)
print("Fixed:", int(float(text)))`,
        },
      },
      result: `9 -9
5 255
1000.0 3.0 (2+3j)
True False False
4 2 2.67
ValueError: invalid literal for int() with base 10: '12.5'
Fixed: 12`,
      explanation: "int() cuts off the decimal part (toward zero). int(s, 0) detects the base from the prefix. round() uses banker's rounding (to the nearest even) and floats like 2.675 are stored slightly below, giving 2.67. int(\"12.5\") fails, so convert to float first.",
    },
    {
      title: "Printing a neat bill with f-string alignment",
      scenario: "Format a shopping bill as an aligned table with item name left-aligned and prices right-aligned.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `items = [("Notebook", 3, 45.0), ("Pen", 10, 12.5), ("Calculator", 1, 899.0)]
print(f"{'Item':<12}{'Qty':>5}{'Price':>10}{'Total':>10}")
print("-" * 37)
grand = 0
for name, qty, price in items:
    total = qty * price
    grand += total
    print(f"{name:<12}{qty:>5}{price:>10.2f}{total:>10.2f}")
print("-" * 37)
print(f"{'Grand Total':<27}{grand:>10.2f}")
print(f"{'GST 18%':<27}{grand * 0.18:>10.2f}")`,
      python: {
        files: {
          "main.py": `items = [("Notebook", 3, 45.0), ("Pen", 10, 12.5), ("Calculator", 1, 899.0)]
print(f"{'Item':<12}{'Qty':>5}{'Price':>10}{'Total':>10}")
print("-" * 37)
grand = 0
for name, qty, price in items:
    total = qty * price
    grand += total
    print(f"{name:<12}{qty:>5}{price:>10.2f}{total:>10.2f}")
print("-" * 37)
print(f"{'Grand Total':<27}{grand:>10.2f}")
print(f"{'GST 18%':<27}{grand * 0.18:>10.2f}")`,
        },
      },
      result: `Item          Qty     Price     Total
-------------------------------------
Notebook        3     45.00    135.00
Pen            10     12.50    125.00
Calculator      1    899.00    899.00
-------------------------------------
Grand Total                   1159.00
GST 18%                        208.62`,
      explanation: ":<12 left-aligns in 12 characters, :>10.2f right-aligns a float with 2 decimals in 10 characters. \"-\" * 37 repeats the dash. This is how reports and receipts are printed in console apps.",
    },
    {
      title: "Comparing format() styles",
      scenario: "Print the same sentence using f-string, str.format() and % formatting, plus number formatting tricks.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `name, age, score = "Ravi", 22, 91.256
print(f"{name} is {age} and scored {score:.1f}")
print("{} is {} and scored {:.1f}".format(name, age, score))
print("{n} is {a} and scored {s:.1f}".format(n=name, a=age, s=score))
print("%s is %d and scored %.1f" % (name, age, score))
print(f"{7:03d} | {0.4567:.2%} | {1234567.891:,.1f} | {255:#x} | {score=}")
print(f"[{name:^10}] [{name:*>8}]")`,
      python: {
        files: {
          "main.py": `name, age, score = "Ravi", 22, 91.256
print(f"{name} is {age} and scored {score:.1f}")
print("{} is {} and scored {:.1f}".format(name, age, score))
print("{n} is {a} and scored {s:.1f}".format(n=name, a=age, s=score))
print("%s is %d and scored %.1f" % (name, age, score))
print(f"{7:03d} | {0.4567:.2%} | {1234567.891:,.1f} | {255:#x} | {score=}")
print(f"[{name:^10}] [{name:*>8}]")`,
        },
      },
      result: `Ravi is 22 and scored 91.3
Ravi is 22 and scored 91.3
Ravi is 22 and scored 91.3
Ravi is 22 and scored 91.3
007 | 45.67% | 1,234,567.9 | 0xff | score=91.256
[   Ravi   ] [****Ravi]`,
      explanation: "All four lines print the same text. Format specs: 03d zero pads, .2% multiplies by 100 and adds %, , adds separators, #x adds the 0x prefix, {score=} prints name=value, ^ centers and *> right-aligns with * fill.",
    },
  ],
  interview: [
    {
      q: "What is the difference between implicit and explicit type conversion?",
      a: "Implicit is done automatically by Python (e.g. int + float -> float). Explicit is done by the programmer using int(), float(), str(), etc.",
      level: "Easy",
    },
    {
      q: "What type does input() return?",
      a: "Always str, even if the user types a number. Convert it with int() or float().",
      level: "Easy",
    },
    {
      q: "What is the output of int(7.9)?",
      a: "7. int() truncates toward zero; it does not round.",
      level: "Easy",
    },
    {
      q: "What is the output of bool(\"False\")?",
      a: "True, because \"False\" is a non-empty string.",
      level: "Medium",
    },
    {
      q: "What happens with int(\"3.14\")?",
      a: "ValueError: invalid literal for int() with base 10. Use int(float(\"3.14\")) to get 3.",
      level: "Medium",
    },
    {
      q: "What is the output of round(2.5) and round(3.5)?",
      a: "2 and 4. Python uses banker's rounding (round half to even).",
      level: "Hard",
    },
    {
      q: "How do you read two integers from one line of input?",
      a: "a, b = map(int, input().split())",
      level: "Easy",
    },
    {
      q: "What are f-strings and why are they preferred?",
      a: "Formatted string literals (Python 3.6+) prefixed with f, allowing expressions inside {}. They are more readable and faster than format() and %.",
      level: "Easy",
    },
    {
      q: "What is the output of print(f\"{3.14159:.2f}\")?",
      a: "3.14",
      level: "Easy",
    },
    {
      q: "How do you print a literal { inside an f-string?",
      a: "Double it: f\"{{\" prints {.",
      level: "Medium",
    },
    {
      q: "What does f\"{x=}\" do?",
      a: "Python 3.8+ self-documenting expression: it prints the expression text, an equals sign and the value, e.g. x=10. Handy for debugging.",
      level: "Medium",
    },
  ],
  practice: [
    {
      task: "Read temperature in Celsius and print Fahrenheit with 1 decimal place.",
      hint: "F = C * 9 / 5 + 32",
      solution: `c = float(input("Celsius: "))
f = c * 9 / 5 + 32
print(f"{c}C = {f:.1f}F")`,
    },
    {
      task: "Read a full name and age on one line separated by a comma (\"Asha,21\") and print \"Asha will be 22 next year\".",
      hint: "split(\",\") then int()",
      solution: `name, age = input().split(",")
print(f"{name.strip()} will be {int(age) + 1} next year")`,
    },
    {
      task: "Read 5 numbers on one line and print their sum and average formatted to 2 decimals.",
      hint: "list(map(float, input().split()))",
      solution: `nums = list(map(float, input().split()))
print(f"Sum: {sum(nums):.2f}, Average: {sum(nums) / len(nums):.2f}")`,
    },
    {
      task: "Print the number 1234567.8 with comma separators and 2 decimals, and also show it as a percentage of 10000000.",
      hint: ":,.2f and :.2%",
      solution: `n = 1234567.8
print(f"{n:,.2f}")
print(f"{n / 10000000:.2%}")`,
    },
    {
      task: "Convert the decimal number 45 into binary, octal and hex strings using format specs and with built-in functions.",
      hint: "f\"{45:b}\" or bin(45)",
      solution: `n = 45
print(f"{n:b} {n:o} {n:x}")
print(bin(n), oct(n), hex(n))`,
    },
  ],
  quiz: [
    {
      question: "What does input() return when the user types 25?",
      options: [
        "int 25",
        "str \"25\"",
        "float 25.0",
        "None",
      ],
      answer: 1,
      explanation: "input() always returns a string.",
    },
    {
      question: "What is the result of 5 + 2.0?",
      options: [
        "7",
        "7.0",
        "\"7.0\"",
        "TypeError",
      ],
      answer: 1,
      explanation: "int is implicitly converted to float.",
    },
    {
      question: "What does f\"{0.5:.0%}\" produce?",
      options: [
        "0.5%",
        "0%",
        "5%",
        "50%",
      ],
      answer: 3,
      explanation: "% format multiplies by 100 and adds the percent sign.",
    },
    {
      question: "Which call raises ValueError?",
      options: [
        "int(\"42\")",
        "float(\"4.2\")",
        "int(\"4.2\")",
        "str(4.2)",
      ],
      answer: 2,
      explanation: "int() cannot parse a string containing a decimal point.",
    },
    {
      question: "What does \"{1}-{0}\".format(\"a\", \"b\") give?",
      options: [
        "b-a",
        "a-b",
        "1-0",
        "Error",
      ],
      answer: 0,
      explanation: "Numbers inside {} refer to argument positions.",
    },
  ],
};
