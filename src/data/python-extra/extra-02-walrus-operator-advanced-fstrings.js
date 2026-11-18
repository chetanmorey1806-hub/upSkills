export default {
  id: "extra-02-walrus-operator-advanced-fstrings",
  title: "Walrus Operator and Advanced f-strings / Format Spec",
  module: "Module 1: Modern Python Syntax",
  extraNo: 2,
  level: "Intermediate",
  duration: "2 hours",
  summary: "Master the walrus operator (:=) to assign and test a value in one expression, and go deep into f-strings: the format specification mini-language for width, alignment, padding, numbers, percentages, dates, the = debug specifier, !r/!s conversions and the Python 3.12 f-string improvements.",
  objectives: [
    "Use the walrus operator := in while loops, if conditions and comprehensions",
    "Know where := is allowed and where it is a SyntaxError",
    "Format numbers with width, alignment, fill, thousands separators, precision and percentages",
    "Use f\"{var=}\" for quick debugging and !r / !s / !a conversions",
    "Format dates inside f-strings and use nested replacement fields",
  ],
  theory: [
    {
      heading: "The Walrus Operator :=",
      content: `The assignment expression operator \`:=\` (nicknamed **walrus** because \`:=\` looks like a walrus's eyes and tusks) was added in Python 3.8 (PEP 572). A normal assignment \`x = 5\` is a *statement*: it cannot be used inside another expression. \`(x := 5)\` is an *expression*: it assigns 5 to x AND gives back the value 5, so you can use it inside an if, while, comprehension or function call.

The main benefit is avoiding repeated work - you compute a value once, store it, and test it in the same line.`,
      syntax: `# without walrus
data = input()
while data != "quit":
    print(data)
    data = input()

# with walrus
while (data := input()) != "quit":
    print(data)
`,
    },
    {
      heading: "Where the Walrus Is Useful (and Where Not)",
      content: `Typical uses: reading chunks in a loop until empty, regex matching (\`if (m := re.search(...)):\`), avoiding a double function call in comprehensions, and keeping a running value.

Rules: an unparenthesised \`:=\` at the top level of a statement is not allowed (\`x := 5\` alone is a SyntaxError - just use \`=\`). You cannot assign to attributes or subscripts (\`obj.x := 1\` and \`a[0] := 1\` are errors). Inside a comprehension, the walrus variable leaks to the enclosing scope, which is sometimes useful (e.g. to get the last value).`,
      points: [
        "`if (n := len(items)) > 10:` - n is available inside the block",
        "`[y for x in data if (y := f(x)) > 0]` - f(x) is called once per item",
        "Always add parentheses around the walrus when combining with comparisons",
      ],
      tip: "Without parentheses, `if n := len(a) > 10` assigns the boolean result of `len(a) > 10` to n, because := has the lowest precedence.",
    },
    {
      heading: "f-string Basics and Conversions",
      content: `An f-string is a string literal prefixed with \`f\` that evaluates expressions inside \`{}\` at runtime. The full form of a replacement field is \`{expression!conversion:format_spec}\`.

Conversions: \`!s\` calls str(), \`!r\` calls repr() (shows quotes for strings - great for logs), \`!a\` calls ascii() (escapes non-ASCII characters like ₹ or é).`,
      syntax: `name = "Asha"
f"{name}"      # Asha
f"{name!r}"    # 'Asha'
f"{name!a}"    # 'Asha'  (non-ASCII would become \\u escapes)
f"{2 * 21}"    # any expression works
`,
    },
    {
      heading: "The Format Spec Mini-Language",
      content: "After the colon comes the format spec. Its general form is `[[fill]align][sign][z][#][0][width][grouping][.precision][type]`. You will mostly use:",
      points: [
        "Align: `<` left, `>` right, `^` centre, `=` pad after sign. Example `{name:<10}`",
        "Fill: any character before align: `{x:*^11}` centres x in 11 chars filled with *",
        "Width and zero padding: `{n:05}` gives 00042",
        "Grouping: `{n:,}` gives 1,234,567 and `{n:_}` gives 1_234_567",
        "Precision: `{price:.2f}` gives 2 decimal places",
        "Types: `d` int, `f` fixed, `e` scientific, `%` percentage, `b` binary, `o` octal, `x`/`X` hex, `g` general",
        "Sign: `+` always shows sign, space shows a space for positives",
        "`#` adds prefix for b/o/x: `{255:#x}` gives 0xff",
      ],
      syntax: `f"{1234567.891:,.2f}"   # 1,234,567.89
f"{0.8567:.1%}"         # 85.7%
f"{42:08b}"             # 00101010
f"{'Total':>10}|"       # '     Total|'
`,
    },
    {
      heading: "Self-documenting Expressions: f\"{x=}\"",
      content: "Python 3.8 added the `=` specifier. `f\"{total=}\"` prints both the expression text and its value: `total=450`. It uses repr() by default, and you can combine it with a format spec: `f\"{price=:.2f}\"`. Spaces around `=` are preserved, so `f\"{x = }\"` gives `x = 5`. This is the fastest way to add debug prints.",
      tip: "Use `print(f\"{len(users)=}\")` while debugging and remove it (or switch to logging) before committing.",
    },
    {
      heading: "Dates, Nested Fields and Python 3.12 Changes",
      content: `Objects can define their own format spec through \`__format__\`. datetime uses strftime codes: \`f"{today:%d-%m-%Y}"\`. Format specs can contain nested replacement fields: \`f"{value:{width}.{prec}f}"\` lets the width and precision come from variables.

Python 3.12 (PEP 701) formalised f-strings in the grammar: you can now **reuse the same quote type** inside the braces (\`f"{d["name"]}"\`), use backslashes and comments inside expressions, and nest f-strings to any depth. In 3.11 and older, reusing the same quotes was a SyntaxError.`,
      syntax: `from datetime import date
d = date(2025, 8, 15)
f"{d:%d %B %Y}"           # 15 August 2025
width, prec = 10, 3
f"{3.14159:{width}.{prec}f}"  # '     3.142'
`,
    },
  ],
  examples: [
    {
      title: "Processing Data in Chunks with Walrus",
      scenario: "A log processor reads a big list of records in batches of 3 until no records are left, without calling the slice function twice.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `records = ["r1", "r2", "r3", "r4", "r5", "r6", "r7"]

def next_batch(size=3):
    global records
    batch, records = records[:size], records[size:]
    return batch

batch_no = 0
while (batch := next_batch()):
    batch_no += 1
    print(f"Batch {batch_no}: {batch}")
print("Done, last batch value:", batch)
`,
      python: {
        files: {
          "main.py": `records = ["r1", "r2", "r3", "r4", "r5", "r6", "r7"]

def next_batch(size=3):
    global records
    batch, records = records[:size], records[size:]
    return batch

batch_no = 0
while (batch := next_batch()):
    batch_no += 1
    print(f"Batch {batch_no}: {batch}")
print("Done, last batch value:", batch)
`,
        },
      },
      result: `Batch 1: ['r1', 'r2', 'r3']
Batch 2: ['r4', 'r5', 'r6']
Batch 3: ['r7']
Done, last batch value: []`,
      explanation: "`batch := next_batch()` stores the batch and the while tests its truthiness. When an empty list comes back the loop stops. Without walrus you would call next_batch() before the loop and again at the end of the loop body.",
    },
    {
      title: "Walrus in if and Comprehensions",
      scenario: "Validate user input with regex and compute expensive values only once while filtering.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import re

text = "Order ID: ORD-2024-778 placed by ravi@example.com"
if (m := re.search(r"ORD-(\\d{4})-(\\d+)", text)):
    print("Year:", m.group(1), "Number:", m.group(2))

def tax(amount):
    print(f"  computing tax for {amount}")
    return round(amount * 0.18, 2)

prices = [100, 20, 500, 40]
big_taxes = [t for p in prices if (t := tax(p)) > 10]
print("Taxes above 10:", big_taxes)
print("Last t leaked from comprehension:", t)

if (n := len(prices)) > 3:
    print(f"List is too long ({n} elements, expected <= 3)")
`,
      python: {
        files: {
          "main.py": `import re

text = "Order ID: ORD-2024-778 placed by ravi@example.com"
if (m := re.search(r"ORD-(\\d{4})-(\\d+)", text)):
    print("Year:", m.group(1), "Number:", m.group(2))

def tax(amount):
    print(f"  computing tax for {amount}")
    return round(amount * 0.18, 2)

prices = [100, 20, 500, 40]
big_taxes = [t for p in prices if (t := tax(p)) > 10]
print("Taxes above 10:", big_taxes)
print("Last t leaked from comprehension:", t)

if (n := len(prices)) > 3:
    print(f"List is too long ({n} elements, expected <= 3)")
`,
        },
      },
      result: `Year: 2024 Number: 778
  computing tax for 100
  computing tax for 20
  computing tax for 500
  computing tax for 40
Taxes above 10: [18.0, 90.0]
Last t leaked from comprehension: 7.2
List is too long (4 elements, expected <= 3)`,
      explanation: "The regex match object is stored and tested in one line. In the comprehension, tax() runs once per price; without walrus you'd write `[tax(p) for p in prices if tax(p) > 10]` and call it twice. The walrus target `t` is visible after the comprehension.",
    },
    {
      title: "Printing a Neat Invoice Table",
      scenario: "A billing script prints an aligned invoice with Indian Rupee amounts, thousands separators and a GST percentage.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `items = [("Laptop", 1, 54999.0), ("Mouse", 2, 499.5), ("USB-C Hub", 1, 1899)]
gst_rate = 0.18

print(f"{'Item':<12}{'Qty':>5}{'Price':>12}{'Amount':>12}")
print("-" * 41)
subtotal = 0
for name, qty, price in items:
    amount = qty * price
    subtotal += amount
    print(f"{name:<12}{qty:>5}{price:>12,.2f}{amount:>12,.2f}")
print("-" * 41)
gst = subtotal * gst_rate
print(f"{'Subtotal':<29}{subtotal:>12,.2f}")
print(f"{'GST ' + format(gst_rate, '.0%'):<29}{gst:>12,.2f}")
print(f"{'TOTAL':*^29}{subtotal + gst:>12,.2f}")
`,
      python: {
        files: {
          "main.py": `items = [("Laptop", 1, 54999.0), ("Mouse", 2, 499.5), ("USB-C Hub", 1, 1899)]
gst_rate = 0.18

print(f"{'Item':<12}{'Qty':>5}{'Price':>12}{'Amount':>12}")
print("-" * 41)
subtotal = 0
for name, qty, price in items:
    amount = qty * price
    subtotal += amount
    print(f"{name:<12}{qty:>5}{price:>12,.2f}{amount:>12,.2f}")
print("-" * 41)
gst = subtotal * gst_rate
print(f"{'Subtotal':<29}{subtotal:>12,.2f}")
print(f"{'GST ' + format(gst_rate, '.0%'):<29}{gst:>12,.2f}")
print(f"{'TOTAL':*^29}{subtotal + gst:>12,.2f}")
`,
        },
      },
      result: `Item          Qty       Price      Amount
-----------------------------------------
Laptop          1   54,999.00   54,999.00
Mouse           2      499.50      999.00
USB-C Hub       1    1,899.00    1,899.00
-----------------------------------------
Subtotal                        57,897.00
GST 18%                         10,421.46
************TOTAL************   68,318.46`,
      explanation: "`<12` left-aligns in 12 chars, `>12,.2f` right-aligns with comma grouping and 2 decimals. `.0%` multiplies by 100 and adds a percent sign. `*^29` centres TOTAL with * fill.",
    },
    {
      title: "Number Bases, Signs and Debug Specifier",
      scenario: "An embedded-systems developer wants to see values in binary/hex and quickly debug variables.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `port = 8080
flags = 42
delta = -3.5
ratio = 0.07531

print(f"{flags:b} | {flags:08b} | {flags:#o} | {flags:#x} | {flags:X}")
print(f"{port:,} | {port:_} | {port:+d} | {delta:+.1f} | {7: d}")
print(f"{ratio:.2%} | {ratio:.3e} | {1234567:g} | {0.00001234:g}")
print(f"{port=}")
print(f"{ratio * 100 = :.2f}")
name = "Zoë"
print(f"{name!s} {name!r} {name!a}")
`,
      python: {
        files: {
          "main.py": `port = 8080
flags = 42
delta = -3.5
ratio = 0.07531

print(f"{flags:b} | {flags:08b} | {flags:#o} | {flags:#x} | {flags:X}")
print(f"{port:,} | {port:_} | {port:+d} | {delta:+.1f} | {7: d}")
print(f"{ratio:.2%} | {ratio:.3e} | {1234567:g} | {0.00001234:g}")
print(f"{port=}")
print(f"{ratio * 100 = :.2f}")
name = "Zoë"
print(f"{name!s} {name!r} {name!a}")
`,
        },
      },
      result: `101010 | 00101010 | 0o52 | 0x2a | 2A
8,080 | 8_080 | +8080 | -3.5 |  7
7.53% | 7.531e-02 | 1.23457e+06 | 1.234e-05
port=8080
ratio * 100 = 7.53
Zoë 'Zoë' 'Zo\\xeb'`,
      explanation: "b/o/x/X change the base; `#` adds 0o/0x prefixes; `08b` zero-pads to 8 digits. `+` forces a sign; a space reserves a sign position. `=` echoes the expression text (spaces kept). `!a` escapes non-ASCII characters.",
    },
    {
      title: "Dynamic Width, Dates and Python 3.12 Quotes",
      scenario: "A report generator chooses column widths at runtime and prints formatted dates. It also shows the 3.12 ability to reuse quotes.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `from datetime import datetime

students = [{"name": "Asha", "marks": 91.456}, {"name": "Ravindra", "marks": 78.2}]
width = max(len(s["name"]) for s in students) + 2
prec = 1
for s in students:
    print(f"{s["name"]:<{width}}|{s["marks"]:>{width}.{prec}f}")

exam = datetime(2025, 3, 7, 14, 5)
print(f"Exam on {exam:%d/%m/%Y} at {exam:%I:%M %p} ({exam:%A})")
print(f"ISO: {exam.isoformat()} | {exam:%Y-%m-%d %H:%M}")
print(f"{'nested ' + f'{3.14159:.2f}'}")
`,
      python: {
        files: {
          "main.py": `from datetime import datetime

students = [{"name": "Asha", "marks": 91.456}, {"name": "Ravindra", "marks": 78.2}]
width = max(len(s["name"]) for s in students) + 2
prec = 1
for s in students:
    print(f"{s["name"]:<{width}}|{s["marks"]:>{width}.{prec}f}")

exam = datetime(2025, 3, 7, 14, 5)
print(f"Exam on {exam:%d/%m/%Y} at {exam:%I:%M %p} ({exam:%A})")
print(f"ISO: {exam.isoformat()} | {exam:%Y-%m-%d %H:%M}")
print(f"{'nested ' + f'{3.14159:.2f}'}")
`,
        },
      },
      result: `Asha      |      91.5
Ravindra  |      78.2
Exam on 07/03/2025 at 02:05 PM (Friday)
ISO: 2025-03-07T14:05:00 | 2025-03-07 14:05
nested 3.14`,
      explanation: "`{width}` and `{prec}` inside the spec are nested replacement fields. `s[\"name\"]` inside a double-quoted f-string works only on Python 3.12+. datetime implements `__format__` so strftime codes work after the colon.",
    },
  ],
  interview: [
    {
      q: "What is the walrus operator and when was it added?",
      a: "`:=` is the assignment expression operator added in Python 3.8 (PEP 572). It assigns a value to a variable and returns that value, so assignment can happen inside an expression such as a while condition, if condition or comprehension.",
      level: "Easy",
    },
    {
      q: "Give a practical use case for the walrus operator.",
      a: "Reading data until it is empty: `while (chunk := f.read(8192)):`. Regex: `if (m := pattern.match(line)):`. Comprehensions where a costly value is both filtered and kept: `[y for x in xs if (y := f(x)) is not None]`.",
      level: "Easy",
    },
    {
      q: "Why is `if n := len(a) > 10:` a bug?",
      a: "`:=` has lower precedence than `>`, so it is parsed as `n := (len(a) > 10)` and n becomes True/False. Write `if (n := len(a)) > 10:`.",
      level: "Medium",
    },
    {
      q: "Can you use `:=` at statement level or with attributes?",
      a: "`x := 5` as a standalone statement is a SyntaxError (use `=`), though `(x := 5)` in parentheses is legal. You cannot assign to attributes or subscripts with walrus: `self.x := 1` and `d['k'] := 1` are SyntaxErrors. Only plain names are allowed.",
      level: "Medium",
    },
    {
      q: "What is the scope of a walrus variable inside a list comprehension?",
      a: "It binds in the enclosing (containing) function or module scope, not in the comprehension's own scope. So the variable is still available after the comprehension. The comprehension's loop variable itself does not leak.",
      level: "Hard",
    },
    {
      q: "What do !r, !s and !a do in an f-string?",
      a: "They apply repr(), str() and ascii() to the value before formatting. `!r` is useful in logs and error messages because it shows quotes and escapes, e.g. `f\"Invalid name {name!r}\"`.",
      level: "Easy",
    },
    {
      q: "Explain the format spec `{amount:>12,.2f}`.",
      a: "Right-align (`>`) in a field 12 characters wide, use comma as thousands separator (`,`), show 2 digits after the decimal point (`.2`) using fixed-point notation (`f`).",
      level: "Medium",
    },
    {
      q: "How do you print a value as a percentage in an f-string?",
      a: "Use the `%` type: `f\"{0.256:.1%}\"` gives `25.6%`. It multiplies by 100 and appends a percent sign. No need to multiply manually.",
      level: "Easy",
    },
    {
      q: "What does f\"{x=}\" do?",
      a: "It is the self-documenting expression (Python 3.8+). It outputs the expression text, an equals sign and the repr of the value, e.g. `x=10`. Whitespace around = is preserved and a format spec can follow: `f\"{x=:.2f}\"`.",
      level: "Easy",
    },
    {
      q: "How can the width of a field come from a variable?",
      a: "Use nested replacement fields in the spec: `f\"{value:{width}.{precision}f}\"` or `f\"{name:<{w}}\"`. The inner braces are evaluated first.",
      level: "Medium",
    },
    {
      q: "What changed for f-strings in Python 3.12?",
      a: "PEP 701 moved f-strings into the formal grammar. You can reuse the same quote type inside expressions (`f\"{d[\"key\"]}\"`), use backslashes and `#` comments inside the braces, write multi-line expressions, and nest f-strings arbitrarily. Error messages also became more precise.",
      level: "Hard",
    },
    {
      q: "f-strings vs str.format() vs % formatting - which to use?",
      a: "f-strings are the most readable and fastest for normal code. `str.format()` is useful when the template is stored separately (e.g. in config or translations) and filled later. `%` formatting is old style but still used by the logging module, where lazy `logger.info('User %s', name)` avoids formatting cost if the message is not emitted.",
      level: "Medium",
    },
  ],
  practice: [
    {
      task: "Given `nums = [4, 9, 15, 2, 30, 7]`, use a list comprehension with walrus to build a list of squares that are greater than 50, computing each square only once.",
      hint: "[sq for n in nums if (sq := n * n) > 50]",
      solution: `nums = [4, 9, 15, 2, 30, 7]
result = [sq for n in nums if (sq := n * n) > 50]
print(result)
`,
    },
    {
      task: "Simulate reading lines from a queue `lines = ['a', 'b', 'STOP', 'c']` using `lines.pop(0)` inside a while-walrus loop that stops when the value is 'STOP'. Print each line before STOP.",
      hint: "while (line := lines.pop(0)) != 'STOP':",
      solution: `lines = ["a", "b", "STOP", "c"]
while (line := lines.pop(0)) != "STOP":
    print("Got:", line)
print("Remaining:", lines)
`,
    },
    {
      task: "Print a salary table for employees [('Asha', 85000), ('Ravi', 120500.5), ('Meena', 9500)] with the name left-aligned in 10 chars, salary right-aligned in 14 chars with commas and 2 decimals, and the share of total salary as a percentage with 1 decimal.",
      hint: "Compute total first, then f\"{name:<10}{sal:>14,.2f}{sal/total:>8.1%}\"",
      solution: `emps = [("Asha", 85000), ("Ravi", 120500.5), ("Meena", 9500)]
total = sum(s for _, s in emps)
for name, sal in emps:
    print(f"{name:<10}{sal:>14,.2f}{sal / total:>8.1%}")
print(f"{'Total':<10}{total:>14,.2f}")
`,
    },
    {
      task: "Write a function `progress(done, total, width=20)` that returns a text progress bar like `[########------------]  40%` using f-strings.",
      hint: "filled = int(width * done / total); use '#' * filled and '-' * (width - filled), and {done/total:>4.0%}.",
      solution: `def progress(done, total, width=20):
    filled = int(width * done / total)
    bar = "#" * filled + "-" * (width - filled)
    return f"[{bar}] {done / total:>4.0%}"

for d in (0, 8, 15, 20):
    print(progress(d, 20))
`,
    },
    {
      task: "Print the number 2025 in decimal, binary (with 0b prefix), octal (0o), hex (0x, upper case digits) and zero-padded to 8 digits, all using one f-string per line with the debug = specifier where useful.",
      hint: "Use #b, #o, #X and 08d. f\"{n=}\" prints n=2025.",
      solution: `n = 2025
print(f"{n=}")
print(f"{n:#b}")
print(f"{n:#o}")
print(f"{n:#X}")
print(f"{n:08d}")
`,
    },
  ],
  quiz: [
    {
      question: "What does `(x := 10) + 5` evaluate to?",
      options: [
        "10",
        "15",
        "SyntaxError",
        "None",
      ],
      answer: 1,
      explanation: "The walrus assigns 10 to x and returns 10, then 10 + 5 = 15.",
    },
    {
      question: "Which of these is a SyntaxError?",
      options: [
        "while (line := f.readline()):",
        "print(y := 3)",
        "self.count := 0",
        "[z for v in data if (z := v * 2)]",
      ],
      answer: 2,
      explanation: "The walrus target must be a simple name; attributes and subscripts are not allowed.",
    },
    {
      question: "What is the output of f\"{1234.5:>10,.1f}|\"?",
      options: [
        "'1,234.5   |'",
        "'   1,234.5|'",
        "'1234.5|'",
        "'  1234.50|'",
      ],
      answer: 1,
      explanation: "Right-aligned in width 10 with comma grouping and 1 decimal: '   1,234.5'.",
    },
    {
      question: "f\"{0.4567:.0%}\" produces...",
      options: [
        "0%",
        "46%",
        "45.67%",
        "0.46%",
      ],
      answer: 1,
      explanation: "The % type multiplies by 100 and rounds to 0 decimals: 46%.",
    },
    {
      question: "If `count = 7`, what does f\"{count = }\" print?",
      options: [
        "7",
        "count=7",
        "count = 7",
        "{count = }",
      ],
      answer: 2,
      explanation: "The = specifier keeps the whitespace written around it.",
    },
    {
      question: "Which conversion shows a string value with quotes?",
      options: [
        "!s",
        "!r",
        "!q",
        ":s",
      ],
      answer: 1,
      explanation: "!r applies repr(), which adds quotes around strings.",
    },
  ],
};
