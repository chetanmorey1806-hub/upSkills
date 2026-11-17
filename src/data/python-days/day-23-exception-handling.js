export default {
  id: "day-23-exception-handling",
  title: "Exception Handling: try, except, else, finally, multiple exceptions",
  module: "Module 4: Exceptions & Files",
  day: 23,
  level: "Intermediate",
  duration: "2 hours",
  summary: "Learn the difference between syntax errors and runtime exceptions, and handle errors gracefully with try, except, else and finally, including catching multiple exception types and reading exception details.",
  objectives: [
    "Differentiate syntax errors from exceptions",
    "Recognise common built-in exceptions (ValueError, TypeError, ZeroDivisionError, KeyError, IndexError, FileNotFoundError)",
    "Use try / except / else / finally correctly",
    "Catch multiple exceptions and access the exception object with as",
    "Understand the exception hierarchy and avoid bare except",
  ],
  theory: [
    {
      heading: "Errors vs Exceptions",
      content: "A syntax error is a grammar mistake (missing colon, wrong indentation); Python refuses to run the file at all. An exception is an error that happens while the program is running, e.g. dividing by zero or converting \"abc\" to int. If an exception is not handled, the program stops and prints a traceback. Exception handling is like a safety net under a tightrope walker: the show continues even if someone slips.",
      points: [
        "ZeroDivisionError: dividing by zero",
        "ValueError: right type, wrong value - int(\"abc\")",
        "TypeError: wrong type - \"5\" + 5",
        "IndexError: list index out of range",
        "KeyError: missing dictionary key",
        "NameError: variable not defined",
        "FileNotFoundError: file does not exist",
        "AttributeError: object has no such attribute",
      ],
    },
    {
      heading: "try and except",
      content: "Put risky code inside try. If an exception occurs, Python jumps to the matching except block and skips the rest of try. If no exception occurs, except blocks are skipped. Use \"as e\" to get the exception object and its message.",
      syntax: `try:
    num = int(input("Number: "))
    print(100 / num)
except ValueError:
    print("Please enter digits only")
except ZeroDivisionError as e:
    print("Error:", e)
`,
    },
    {
      heading: "Multiple Exceptions",
      content: "You can write several except blocks (checked top to bottom, first match wins) or catch several types in one block using a tuple. Put specific exceptions before general ones; except Exception catches almost everything, so it must come last.",
      syntax: `try:
    ...
except (ValueError, TypeError) as e:
    print("Bad input:", type(e).__name__)
except Exception as e:
    print("Unexpected:", e)
`,
      tip: "Avoid a bare except: - it also catches KeyboardInterrupt and SystemExit and hides bugs. Catch the specific exceptions you expect.",
    },
    {
      heading: "else and finally",
      content: "else runs only if the try block finished WITHOUT an exception - put the \"success\" code there so you do not accidentally catch its errors. finally ALWAYS runs - error or not, even after return - so it is used for clean-up like closing files or database connections. Analogy: try = attempt the exam, except = handle failure, else = celebrate success, finally = go home either way.",
      syntax: `try:
    f = open("data.txt")
except FileNotFoundError:
    print("File missing")
else:
    print(f.read())
    f.close()
finally:
    print("Done")
`,
    },
    {
      heading: "Exception Hierarchy",
      content: "All built-in exceptions are classes. BaseException is the root; Exception is the parent of almost all errors you should catch. Catching a parent class also catches its children: LookupError catches both IndexError and KeyError; ArithmeticError catches ZeroDivisionError and OverflowError; OSError catches FileNotFoundError and PermissionError.",
      syntax: `BaseException
 +-- SystemExit, KeyboardInterrupt
 +-- Exception
      +-- ArithmeticError -> ZeroDivisionError
      +-- LookupError -> IndexError, KeyError
      +-- ValueError, TypeError, NameError
      +-- OSError -> FileNotFoundError, PermissionError
`,
    },
  ],
  examples: [
    {
      title: "Safe Division Calculator",
      scenario: "A calculator reads two numbers from the user and must not crash on bad input or division by zero.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Type the inputs when asked: 100, 0",
        "Compare your terminal output with the result shown below",
      ],
      code: `def divide(a_text, b_text):
    try:
        a = float(a_text)
        b = float(b_text)
        result = a / b
    except ValueError:
        return "Error: please enter numbers only"
    except ZeroDivisionError:
        return "Error: cannot divide by zero"
    else:
        return f"Result = {result:.2f}"
    finally:
        print(f"[log] tried {a_text!r} / {b_text!r}")

a = input("First number: ")
b = input("Second number: ")
print()
print(divide(a, b))
print(divide("45", "4"))
print(divide("ten", "2"))
`,
      python: {
        files: {
          "main.py": `def divide(a_text, b_text):
    try:
        a = float(a_text)
        b = float(b_text)
        result = a / b
    except ValueError:
        return "Error: please enter numbers only"
    except ZeroDivisionError:
        return "Error: cannot divide by zero"
    else:
        return f"Result = {result:.2f}"
    finally:
        print(f"[log] tried {a_text!r} / {b_text!r}")

a = input("First number: ")
b = input("Second number: ")
print()
print(divide(a, b))
print(divide("45", "4"))
print(divide("ten", "2"))
`,
        },
        stdin: `100
0
`,
      },
      result: `First number: Second number: 
[log] tried '100' / '0'
Error: cannot divide by zero
[log] tried '45' / '4'
Result = 11.25
[log] tried 'ten' / '2'
Error: please enter numbers only`,
      explanation: "Each call goes through try. Division by zero and invalid numbers are caught by matching except blocks. else runs only on success. finally runs for every call - even though every branch returns - which is why the log line prints before each result.",
    },
    {
      title: "Catching Multiple Exceptions and Reading Details",
      scenario: "Process a mixed list of operations and report which exception happened for each.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `data = {"a": 10}
items = [1, 2, 3]

tasks = [
    lambda: items[5],
    lambda: data["z"],
    lambda: int("12x"),
    lambda: "5" + 5,
    lambda: 10 / 0,
    lambda: undefined_name,
    lambda: items[0] + data["a"],
]

for i, task in enumerate(tasks, 1):
    try:
        value = task()
    except (IndexError, KeyError) as e:
        print(i, "Lookup problem:", type(e).__name__, e)
    except (ValueError, TypeError) as e:
        print(i, "Bad value/type:", type(e).__name__, "-", e)
    except Exception as e:
        print(i, "Other error:", type(e).__name__, "-", e)
    else:
        print(i, "OK ->", value)
`,
      python: {
        files: {
          "main.py": `data = {"a": 10}
items = [1, 2, 3]

tasks = [
    lambda: items[5],
    lambda: data["z"],
    lambda: int("12x"),
    lambda: "5" + 5,
    lambda: 10 / 0,
    lambda: undefined_name,
    lambda: items[0] + data["a"],
]

for i, task in enumerate(tasks, 1):
    try:
        value = task()
    except (IndexError, KeyError) as e:
        print(i, "Lookup problem:", type(e).__name__, e)
    except (ValueError, TypeError) as e:
        print(i, "Bad value/type:", type(e).__name__, "-", e)
    except Exception as e:
        print(i, "Other error:", type(e).__name__, "-", e)
    else:
        print(i, "OK ->", value)
`,
        },
      },
      result: `1 Lookup problem: IndexError list index out of range
2 Lookup problem: KeyError 'z'
3 Bad value/type: ValueError - invalid literal for int() with base 10: '12x'
4 Bad value/type: TypeError - can only concatenate str (not "int") to str
5 Other error: ZeroDivisionError - division by zero
6 Other error: NameError - name 'undefined_name' is not defined
7 OK -> 11`,
      explanation: "Tuples group related exceptions in one block. type(e).__name__ gives the exception class name and str(e) gives the message. The general except Exception is last so specific blocks get the first chance. The final task succeeds, so else runs.",
    },
    {
      title: "Retry Until Valid Input",
      scenario: "Keep asking for an age until the user enters a valid positive integer.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Type the inputs when asked: abc, -5, 22",
        "Compare your terminal output with the result shown below",
      ],
      code: `while True:
    text = input("Enter age: ")
    try:
        age = int(text)
        if age <= 0:
            raise ValueError("age must be positive")
    except ValueError as e:
        print(f"\\n  Invalid ({e}). Try again.")
    else:
        print(f"\\nAge saved: {age}")
        break
`,
      python: {
        files: {
          "main.py": `while True:
    text = input("Enter age: ")
    try:
        age = int(text)
        if age <= 0:
            raise ValueError("age must be positive")
    except ValueError as e:
        print(f"\\n  Invalid ({e}). Try again.")
    else:
        print(f"\\nAge saved: {age}")
        break
`,
        },
        stdin: `abc
-5
22
`,
      },
      result: `Enter age: 
  Invalid (invalid literal for int() with base 10: 'abc'). Try again.
Enter age: 
  Invalid (age must be positive). Try again.
Enter age: 
Age saved: 22`,
      explanation: "int(\"abc\") raises ValueError automatically. For -5 we raise ValueError ourselves (raise is covered in detail tomorrow). The loop breaks only from the else block, i.e. when no exception happened.",
    },
    {
      title: "finally for Clean-up and Hierarchy Catching",
      scenario: "Make sure a \"connection\" is always closed, and catch a family of errors with a parent class.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def fetch(record_id):
    print("open connection")
    try:
        records = {1: "Asha", 2: "Ravi"}
        return records[record_id]
    finally:
        print("close connection")   # runs even after return / error

print(fetch(1))
try:
    fetch(9)
except LookupError as e:          # parent of KeyError and IndexError
    print("Caught", type(e).__name__, "via LookupError:", e)

print(issubclass(ZeroDivisionError, ArithmeticError))
print(issubclass(FileNotFoundError, OSError))
print(ZeroDivisionError.__mro__)
`,
      python: {
        files: {
          "main.py": `def fetch(record_id):
    print("open connection")
    try:
        records = {1: "Asha", 2: "Ravi"}
        return records[record_id]
    finally:
        print("close connection")   # runs even after return / error

print(fetch(1))
try:
    fetch(9)
except LookupError as e:          # parent of KeyError and IndexError
    print("Caught", type(e).__name__, "via LookupError:", e)

print(issubclass(ZeroDivisionError, ArithmeticError))
print(issubclass(FileNotFoundError, OSError))
print(ZeroDivisionError.__mro__)
`,
        },
      },
      result: `open connection
close connection
Asha
open connection
close connection
Caught KeyError via LookupError: 9
True
True
(<class 'ZeroDivisionError'>, <class 'ArithmeticError'>, <class 'Exception'>, <class 'BaseException'>, <class 'object'>)`,
      explanation: "finally runs before the function actually returns and also when an exception escapes. KeyError is a subclass of LookupError, so the parent class catches it. __mro__ shows the class chain up to BaseException and object.",
    },
  ],
  interview: [
    {
      q: "What is the difference between an error and an exception?",
      a: "Syntax errors are detected before running and stop the program from starting. Exceptions occur during execution and can be caught and handled with try/except.",
      level: "Easy",
    },
    {
      q: "When does the else block of a try statement run?",
      a: "Only when the try block completes without raising any exception (and before finally).",
      level: "Easy",
    },
    {
      q: "When does finally run?",
      a: "Always: after try succeeds, after an except handles an error, when an exception propagates, and even when try or except contains return, break or continue.",
      level: "Easy",
    },
    {
      q: "Why is a bare except: considered bad practice?",
      a: "It catches everything including KeyboardInterrupt and SystemExit, hides real bugs, and makes debugging hard. Catch specific exceptions, or at most except Exception.",
      level: "Medium",
    },
    {
      q: `What is the output of this code?

try:
    print("A")
    x = 1 / 0
    print("B")
except ZeroDivisionError:
    print("C")
else:
    print("D")
finally:
    print("E")
`,
      a: `Output:
A
C
E

"B" is skipped because the exception jumps to except. else is skipped because an error happened. finally always runs.`,
      level: "Easy",
    },
    {
      q: `What is the output of this code?

def f():
    try:
        return "try"
    finally:
        print("finally runs")

print(f())
`,
      a: `Output:
finally runs
try

finally executes before the function returns the value, so its print appears first.`,
      level: "Medium",
    },
    {
      q: `What is the output of this code?

def g():
    try:
        return 1
    finally:
        return 2
print(g())
`,
      a: `Output:
2

A return inside finally overrides the return from try. (Avoid returning from finally - it also swallows exceptions.)`,
      level: "Hard",
    },
    {
      q: `What is the output of this code?

try:
    d = {}
    d["k"]
except LookupError:
    print("lookup")
except KeyError:
    print("key")
`,
      a: `Output:
lookup

Except blocks are tested in order; KeyError is a subclass of LookupError, so the first block matches and the second is never reached.`,
      level: "Medium",
    },
    {
      q: "How do you catch multiple exceptions in one except block?",
      a: "Use a tuple: except (ValueError, TypeError) as e:",
      level: "Easy",
    },
    {
      q: "Why put success code in else instead of at the end of try?",
      a: "Code in else is not protected by the except clauses, so you do not accidentally catch exceptions you did not expect from that code. It also makes intent clear.",
      level: "Medium",
    },
  ],
  practice: [
    {
      task: "Write safe_int(text, default=0) that returns int(text) or default if conversion fails.",
      hint: "Catch ValueError (and TypeError for None).",
      solution: `def safe_int(text, default=0):
    try:
        return int(text)
    except (ValueError, TypeError):
        return default

print(safe_int("42"), safe_int("4x"), safe_int(None, -1))
`,
    },
    {
      task: "Read a list index from the user and print the item from fruits; handle ValueError and IndexError separately.",
      hint: "Two except blocks.",
      solution: `fruits = ["apple", "banana", "mango"]
try:
    i = int(input("Index: "))
    print(fruits[i])
except ValueError:
    print("Enter a number")
except IndexError:
    print("Index must be between 0 and", len(fruits) - 1)
`,
    },
    {
      task: "Write get_price(menu, item) that returns the price or prints \"Not on menu\" using try/except KeyError, with finally printing \"Lookup finished\".",
      hint: "Return inside try, print inside finally.",
      solution: `def get_price(menu, item):
    try:
        return menu[item]
    except KeyError:
        print("Not on menu")
        return None
    finally:
        print("Lookup finished")

menu = {"tea": 15, "coffee": 25}
print(get_price(menu, "tea"))
print(get_price(menu, "juice"))
`,
    },
    {
      task: "Given values = [10, \"5\", 0, None, 4], compute 100 / int(v) for each and print the result or the exception name.",
      hint: "Use a loop with try/except Exception as e and type(e).__name__.",
      solution: `values = [10, "5", 0, None, 4]
for v in values:
    try:
        print(v, "->", 100 / int(v))
    except Exception as e:
        print(v, "->", type(e).__name__)
`,
    },
  ],
  quiz: [
    {
      question: "Which block runs only when no exception occurs?",
      options: [
        "except",
        "finally",
        "else",
        "try",
      ],
      answer: 2,
      explanation: "else runs only on success.",
    },
    {
      question: "Which exception does int(\"abc\") raise?",
      options: [
        "TypeError",
        "ValueError",
        "NameError",
        "SyntaxError",
      ],
      answer: 1,
      explanation: "The type is right (str) but the value cannot be converted.",
    },
    {
      question: "Which class is the parent of both KeyError and IndexError?",
      options: [
        "LookupError",
        "ValueError",
        "OSError",
        "ArithmeticError",
      ],
      answer: 0,
      explanation: "LookupError is the base class for both.",
    },
    {
      question: "What is the correct way to catch two exceptions in one block?",
      options: [
        "except ValueError or TypeError:",
        "except ValueError, TypeError:",
        "except [ValueError, TypeError]:",
        "except (ValueError, TypeError):",
      ],
      answer: 3,
      explanation: "A tuple of exception classes is required.",
    },
    {
      question: "Which block is guaranteed to run whether an exception happens or not?",
      options: [
        "else",
        "except",
        "finally",
        "None of them",
      ],
      answer: 2,
      explanation: "finally always runs.",
    },
  ],
};
