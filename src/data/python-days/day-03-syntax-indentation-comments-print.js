export default {
  id: "day-03-syntax-indentation-comments-print",
  title: "Syntax, Indentation, Comments, Keywords, Identifiers, print() Options (sep, end)",
  module: "Module 1: Python Basics",
  day: 3,
  level: "Beginner",
  duration: "2 hours",
  summary: "Learn the basic grammar of Python: statements, indentation-based blocks, comments, reserved keywords, rules for naming identifiers, and how to control print() output with sep and end.",
  objectives: [
    "Write correctly structured Python statements and blocks using indentation",
    "Use single-line comments, multi-line comments and docstrings",
    "List Python keywords and know they cannot be used as names",
    "Apply the rules and conventions (PEP 8) for identifiers",
    "Control print() output using sep, end and multiple arguments",
  ],
  theory: [
    {
      heading: "Python syntax and statements",
      content: "Syntax means the grammar rules of a language. In Python one line usually contains one statement, and the end of the line ends the statement; there is no semicolon needed. You can put two statements on one line with a semicolon, but it is considered bad style. A long statement can continue on the next line using a backslash \\ or, better, by wrapping it in brackets ( ), [ ], { }. Python is case-sensitive: Name, name and NAME are three different things.",
      syntax: `x = 10                 # one statement per line
a = 1; b = 2           # allowed, but avoid
total = (10 + 20 +
         30 + 40)      # line continuation inside brackets
message = "Hello " \\
          "World"      # continuation with backslash`,
      points: [
        "No semicolons and no curly braces for blocks",
        "Case-sensitive: print works, Print gives NameError",
        "Blank lines are ignored and help readability",
      ],
    },
    {
      heading: "Indentation: how Python makes blocks",
      content: "In C or Java, a block of code is wrapped in { }. In Python, a block is created by indentation (spaces at the start of the line). A line ending with a colon : (if, for, while, def, class...) starts a block, and every line of that block must be indented by the same amount. PEP 8 says use 4 spaces. When the indentation goes back, the block ends. Think of it like a book: a sub-point is pushed to the right under its heading.",
      syntax: `age = 20
if age >= 18:
    print("Adult")          # inside the if block (4 spaces)
    print("Can vote")       # same block
print("Done")               # outside the block`,
      points: [
        "IndentationError: expected an indented block - you forgot to indent after :",
        "IndentationError: unexpected indent - a line is indented for no reason",
        "TabError: mixing tabs and spaces - configure the editor to insert 4 spaces for Tab (VS Code and PyCharm do it by default)",
      ],
      tip: "Indentation is not decoration in Python; it is part of the syntax. Wrong indentation either crashes or silently changes the logic.",
    },
    {
      heading: "Comments and docstrings",
      content: "Comments are notes for humans; Python ignores them. A single-line comment starts with #. Python has no special multi-line comment syntax, so we either put # on each line or use a triple-quoted string \"\"\" ... \"\"\" that is not assigned to anything. A triple-quoted string written as the first line of a module, function or class is called a docstring; it becomes documentation you can read with help() or __doc__.",
      syntax: `# This is a single-line comment
x = 5  # inline comment after code

# Multi-line comment
# using several hash lines

"""
This triple-quoted string is not stored anywhere,
so it works like a multi-line comment.
"""

def greet():
    """Return a greeting message."""   # docstring
    return "Hi"`,
      points: [
        "Write comments that explain WHY, not WHAT the code obviously does",
        "Shortcut: Ctrl+/ toggles comments in VS Code and PyCharm",
      ],
    },
    {
      heading: "Keywords (reserved words)",
      content: "Keywords are words that have a special meaning in Python, so you cannot use them as variable or function names. Python 3.12 has 35 keywords. Note that True, False and None start with capital letters. Soft keywords like match, case, _ and type have special meaning only in certain places.",
      syntax: `False   None    True    and     as      assert  async
await   break   class   continue def    del     elif
else    except  finally for     from    global  if
import  in      is      lambda  nonlocal not    or
pass    raise   return  try     while   with    yield`,
      points: [
        "See them in code: import keyword; print(keyword.kwlist)",
        "class = 5 gives SyntaxError because class is a keyword",
        "print, len, list, str are NOT keywords; they are built-in functions. You CAN overwrite them, but you should not.",
      ],
    },
    {
      heading: "Identifiers: naming rules and conventions",
      content: "An identifier is the name you give to a variable, function, class or module. Rules (must follow, else SyntaxError): it can contain letters, digits and underscore; it cannot start with a digit; it cannot be a keyword; no spaces or special symbols like @, $, -, %. Conventions (PEP 8, should follow): snake_case for variables and functions, PascalCase for classes, UPPER_CASE for constants, and a leading underscore _name for \"internal\" names.",
      points: [
        "Valid: student_name, _count, total2, MAX_SIZE, StudentRecord",
        "Invalid: 2total (starts with digit), student-name (hyphen), my name (space), for (keyword), price$ (symbol)",
        "Names are case-sensitive: Age and age are different",
        "Use meaningful names: total_marks is better than tm",
      ],
    },
    {
      heading: "print() in detail: sep and end",
      content: "print() can take any number of values separated by commas. By default it separates them with a single space (sep=\" \") and finishes with a new line (end=\"\\n\"). You can change both. sep is what goes BETWEEN values; end is what goes AFTER the last value. Special characters inside strings are called escape sequences: \\n new line, \\t tab, \\\\ backslash, \\\" double quote.",
      syntax: `print(value1, value2, ..., sep=' ', end='\\n', file=sys.stdout, flush=False)

print("a", "b", "c")             # a b c
print("a", "b", "c", sep="-")    # a-b-c
print("Hello", end=" ")          # stays on same line
print("World")                   # Hello World`,
      tip: "A print() with no arguments prints just an empty line.",
    },
  ],
  examples: [
    {
      title: "Indentation decides what is inside a block",
      scenario: "A shop gives a discount only when the bill is 1000 or more. See which lines belong to the if block.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `bill = 1500
if bill >= 1000:
    discount = bill * 10 / 100
    print("Discount applied:", discount)
    bill = bill - discount
print("Final bill:", bill)
print("Thank you for shopping!")`,
      python: {
        files: {
          "main.py": `bill = 1500
if bill >= 1000:
    discount = bill * 10 / 100
    print("Discount applied:", discount)
    bill = bill - discount
print("Final bill:", bill)
print("Thank you for shopping!")`,
        },
      },
      result: `Discount applied: 150.0
Final bill: 1350.0
Thank you for shopping!`,
      explanation: "The three indented lines run only when the condition is True. The last two lines are not indented, so they always run. If you change bill to 500, only the last two lines print.",
    },
    {
      title: "Using sep and end",
      scenario: "Print a date in DD/MM/YYYY format, an email address, and a countdown on a single line.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `print(17, 11, 2026, sep="/")
print("asha", "gmail.com", sep="@")
print("Loading", end="")
print(".", end="")
print(".", end="")
print(".")
for i in [3, 2, 1]:
    print(i, end=" ")
print("Go!")
print("A", "B", "C", sep=" | ", end=" <end>\\n")`,
      python: {
        files: {
          "main.py": `print(17, 11, 2026, sep="/")
print("asha", "gmail.com", sep="@")
print("Loading", end="")
print(".", end="")
print(".", end="")
print(".")
for i in [3, 2, 1]:
    print(i, end=" ")
print("Go!")
print("A", "B", "C", sep=" | ", end=" <end>\\n")`,
        },
      },
      result: `17/11/2026
asha@gmail.com
Loading...
3 2 1 Go!
A | B | C <end>`,
      explanation: "sep=\"/\" joins the three numbers with a slash. end=\"\" stops print from going to the next line, so the dots appear after Loading. The countdown uses end=\" \" to keep numbers on one line, and the final print adds a custom end text before the newline.",
    },
    {
      title: "Escape sequences in strings",
      scenario: "Print a small formatted table using tab and newline characters, and print a Windows path and quotes.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `print("Name\\tCity\\tAge")
print("Asha\\tPune\\t21")
print("Ravi\\tDelhi\\t23")
print("Line1\\nLine2")
print("Path: C:\\\\Users\\\\asha")
print("She said \\"Hello\\"")
print('It\\'s Python')
print(r"Raw string: C:\\new\\table")`,
      python: {
        files: {
          "main.py": `print("Name\\tCity\\tAge")
print("Asha\\tPune\\t21")
print("Ravi\\tDelhi\\t23")
print("Line1\\nLine2")
print("Path: C:\\\\Users\\\\asha")
print("She said \\"Hello\\"")
print('It\\'s Python')
print(r"Raw string: C:\\new\\table")`,
        },
      },
      result: `Name	City	Age
Asha	Pune	21
Ravi	Delhi	23
Line1
Line2
Path: C:\\Users\\asha
She said "Hello"
It's Python
Raw string: C:\\new\\table`,
      explanation: "\\t inserts a tab, \\n a new line, \\\\ a single backslash, and \\\" a quote inside a string. A raw string r\"...\" ignores escape sequences, which is useful for Windows paths and regex.",
    },
    {
      title: "List all Python keywords and test identifiers",
      scenario: "Use the keyword module to count keywords and check whether some names are valid identifiers.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `import keyword

print("Total keywords:", len(keyword.kwlist))
print("First 5:", keyword.kwlist[:5])

names = ["student_name", "2total", "for", "_count", "my-name", "Class"]
for n in names:
    ok = n.isidentifier() and not keyword.iskeyword(n)
    print(n, "->", "valid" if ok else "invalid")`,
      python: {
        files: {
          "main.py": `import keyword

print("Total keywords:", len(keyword.kwlist))
print("First 5:", keyword.kwlist[:5])

names = ["student_name", "2total", "for", "_count", "my-name", "Class"]
for n in names:
    ok = n.isidentifier() and not keyword.iskeyword(n)
    print(n, "->", "valid" if ok else "invalid")`,
        },
      },
      result: `Total keywords: 35
First 5: ['False', 'None', 'True', 'and', 'as']
student_name -> valid
2total -> invalid
for -> invalid
_count -> valid
my-name -> invalid
Class -> valid`,
      explanation: "kwlist holds all keywords. str.isidentifier() checks the naming rules, and keyword.iskeyword() rejects reserved words. \"Class\" is valid because Python is case-sensitive; only lowercase class is a keyword.",
    },
    {
      title: "Comments and docstrings in a small program",
      scenario: "Write a well-commented function to calculate the area of a rectangle and read its docstring.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `# Program: rectangle area calculator
# Author : Asha

def area(length, width):
    """Return the area of a rectangle given length and width."""
    return length * width   # formula: l x w

print("Area:", area(5, 3))
print("Docstring:", area.__doc__)`,
      python: {
        files: {
          "main.py": `# Program: rectangle area calculator
# Author : Asha

def area(length, width):
    """Return the area of a rectangle given length and width."""
    return length * width   # formula: l x w

print("Area:", area(5, 3))
print("Docstring:", area.__doc__)`,
        },
      },
      result: `Area: 15
Docstring: Return the area of a rectangle given length and width.`,
      explanation: "The # lines are ignored by Python. The triple-quoted string right after def is a docstring and is stored in area.__doc__, so tools and help(area) can display it.",
    },
  ],
  interview: [
    {
      q: "Why is indentation important in Python?",
      a: "Python uses indentation to define blocks of code (instead of braces). Wrong indentation causes IndentationError or changes program logic. PEP 8 recommends 4 spaces.",
      level: "Easy",
    },
    {
      q: "What is the difference between a comment and a docstring?",
      a: "A comment (#) is ignored completely by the interpreter. A docstring is a string literal as the first statement of a module/class/function; it is stored in __doc__ and used by help().",
      level: "Medium",
    },
    {
      q: "Does Python support multi-line comments?",
      a: "Not officially. We use # on each line, or a triple-quoted string that is not assigned (it is evaluated and discarded).",
      level: "Easy",
    },
    {
      q: "What are the rules for naming an identifier?",
      a: "Only letters, digits and underscore; cannot start with a digit; cannot be a keyword; case-sensitive; no spaces or special symbols.",
      level: "Easy",
    },
    {
      q: "Is print a keyword in Python 3?",
      a: "No. print is a built-in function in Python 3 (it was a statement in Python 2). You can check with keyword.iskeyword(\"print\") which returns False.",
      level: "Medium",
    },
    {
      q: "What is the output of print(\"a\", \"b\", sep=\"\", end=\"!\")?",
      a: "ab! (no separator between values, and ! instead of a newline at the end).",
      level: "Easy",
    },
    {
      q: "What is the output of print(1, 2, 3, sep=\"-\", end=\".\")?",
      a: "1-2-3.",
      level: "Easy",
    },
    {
      q: "Which of these are valid identifiers: _x, 9lives, total_sum, def, Name?",
      a: "_x, total_sum and Name are valid. 9lives starts with a digit and def is a keyword.",
      level: "Easy",
    },
    {
      q: "What is the difference between TabError and IndentationError?",
      a: "IndentationError is raised for missing or unexpected indentation. TabError (a subclass) is raised when tabs and spaces are mixed inconsistently in the same block.",
      level: "Medium",
    },
    {
      q: "What is the default value of sep and end in print()?",
      a: "sep defaults to a single space \" \" and end defaults to newline \"\\n\".",
      level: "Easy",
    },
  ],
  practice: [
    {
      task: "Print the time 09:45:30 using three numbers and sep.",
      hint: "Use strings \"09\", \"45\", \"30\" to keep leading zeros.",
      solution: `print("09", "45", "30", sep=":")`,
    },
    {
      task: "Print numbers 1 to 5 on one line separated by commas, using a loop and end.",
      hint: "print(i, end=\",\")",
      solution: `for i in range(1, 6):
    print(i, end=",")
print()`,
    },
    {
      task: "Write a program with a docstring that prints a box of stars 3 lines high using \\n in a single print.",
      hint: "print(\"***\\n***\\n***\")",
      solution: `"""Prints a 3x3 box of stars."""
print("***\\n***\\n***")`,
    },
    {
      task: "Check whether \"lambda\", \"Lambda\" and \"my_var1\" are keywords and valid identifiers.",
      hint: "keyword.iskeyword() and str.isidentifier()",
      solution: `import keyword
for w in ["lambda", "Lambda", "my_var1"]:
    print(w, keyword.iskeyword(w), w.isidentifier())`,
    },
  ],
  quiz: [
    {
      question: "How many spaces does PEP 8 recommend for one indentation level?",
      options: [
        "2",
        "4",
        "8",
        "A tab only",
      ],
      answer: 1,
      explanation: "PEP 8 recommends 4 spaces per indentation level.",
    },
    {
      question: "Which is a valid identifier?",
      options: [
        "1st_name",
        "first-name",
        "first_name",
        "first name",
      ],
      answer: 2,
      explanation: "Only letters, digits and _ are allowed, and it cannot start with a digit.",
    },
    {
      question: "What does print(\"x\", \"y\", sep=\"*\") display?",
      options: [
        "x y",
        "x*y",
        "*x*y",
        "xy*",
      ],
      answer: 1,
      explanation: "sep is placed between values.",
    },
    {
      question: "Which symbol starts a single-line comment?",
      options: [
        "//",
        "/*",
        "--",
        "#",
      ],
      answer: 3,
      explanation: "Python comments start with #.",
    },
    {
      question: "Which of the following is a keyword?",
      options: [
        "None",
        "print",
        "input",
        "main",
      ],
      answer: 0,
      explanation: "None is a keyword. print and input are built-in functions; main is just a name.",
    },
  ],
};
