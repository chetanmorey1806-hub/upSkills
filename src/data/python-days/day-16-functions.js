export default {
  id: "day-16-functions",
  title: "Functions: def, Parameters, Return, Default and Keyword Arguments",
  module: "Module 3: Functions & Modules",
  day: 16,
  level: "Beginner",
  duration: "2 hours",
  summary: "Learn to package reusable logic into functions using def, pass data in through parameters, send results back with return, and make calls flexible with default and keyword arguments.",
  objectives: [
    "Define and call functions using def",
    "Explain the difference between parameters and arguments",
    "Return one or many values from a function and understand the implicit None",
    "Use default values and keyword arguments correctly",
    "Avoid the mutable default argument trap",
  ],
  theory: [
    {
      heading: "What is a Function?",
      content: "A function is a named block of code that does one job. You write it once and call it whenever you need it. Think of a function like a juicer machine: you put fruit in (inputs), press the button (call), and juice comes out (return value). You do not need to know how the motor works every time you want juice. Functions make code reusable, shorter, easier to test and easier to read.",
      points: [
        "Built-in functions: print(), len(), sum(), max() ... already given by Python",
        "User-defined functions: functions you create with def",
        "DRY principle: Do not Repeat Yourself - repeated code should become a function",
      ],
    },
    {
      heading: "Defining and Calling a Function",
      content: "Use the def keyword, a function name, parentheses with parameters, and a colon. The body is indented. Defining a function does NOT run it; it only runs when you call it with parentheses. An optional docstring (triple-quoted string on the first line) documents what the function does.",
      syntax: `def function_name(param1, param2):
    """Docstring: what this function does."""
    # body
    return result

value = function_name(arg1, arg2)   # calling
`,
      tip: "Use verb names in snake_case: calculate_total, send_email, is_valid.",
    },
    {
      heading: "Parameters vs Arguments",
      content: "Parameters are the variable names written in the function definition. Arguments are the actual values you pass while calling. In def greet(name): name is a parameter; in greet(\"Asha\"), \"Asha\" is an argument. Positional arguments are matched left to right, so order matters.",
      points: [
        "Missing a required argument raises TypeError: missing 1 required positional argument",
        "Passing too many arguments also raises TypeError",
      ],
    },
    {
      heading: "The return Statement",
      content: "return sends a value back to the caller and immediately exits the function. A function without return (or with a bare return) gives back None. You can return multiple values separated by commas: Python packs them into a tuple which you can unpack.",
      syntax: `def min_max(nums):
    return min(nums), max(nums)   # returns a tuple

low, high = min_max([4, 9, 1])
`,
      points: [
        "print() shows a value on screen; return hands the value back to the code",
        "Code written after return in the same block never runs",
      ],
    },
    {
      heading: "Default and Keyword Arguments",
      content: "A default argument has a value in the definition, so the caller may skip it: def greet(name, msg=\"Hello\"). Keyword arguments are passed using the parameter name: greet(msg=\"Hi\", name=\"Ravi\"), so order does not matter. Rules: parameters with defaults must come after parameters without defaults, and in a call, positional arguments must come before keyword arguments.",
      syntax: `def make_tea(sugar=1, milk=True):
    ...
make_tea()                 # uses defaults
make_tea(2)                # sugar=2
make_tea(milk=False)       # keyword argument
`,
    },
    {
      heading: "Common Mistake: Mutable Default Arguments",
      content: "Default values are created only ONCE, when the function is defined, not every time it is called. If you use a list or dict as a default and modify it, the change stays for the next call. The safe pattern is to use None as the default and create a new list inside the function.",
      syntax: `def add_item(item, bucket=None):
    if bucket is None:
        bucket = []
    bucket.append(item)
    return bucket
`,
      tip: "Interviewers love this question. Remember: \"defaults are evaluated once at definition time\".",
    },
  ],
  examples: [
    {
      title: "Simple Bill Calculator Function",
      scenario: "A shop wants a function that calculates the bill amount with GST for any price and quantity.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def calculate_bill(price, qty, gst=18):
    """Return total bill including GST percent."""
    subtotal = price * qty
    tax = subtotal * gst / 100
    return subtotal + tax

print(calculate_bill(100, 2))            # default gst 18
print(calculate_bill(100, 2, 5))         # positional gst
print(calculate_bill(qty=3, price=50, gst=12))  # keyword args
`,
      python: {
        files: {
          "main.py": `def calculate_bill(price, qty, gst=18):
    """Return total bill including GST percent."""
    subtotal = price * qty
    tax = subtotal * gst / 100
    return subtotal + tax

print(calculate_bill(100, 2))            # default gst 18
print(calculate_bill(100, 2, 5))         # positional gst
print(calculate_bill(qty=3, price=50, gst=12))  # keyword args
`,
        },
      },
      result: `236.0
210.0
168.0`,
      explanation: "gst has a default of 18, so the first call uses it. The second call passes 5 positionally. The third call uses keyword arguments, so order does not matter. The function returns the value and print() displays it.",
    },
    {
      title: "Returning Multiple Values",
      scenario: "A teacher wants the lowest, highest and average marks of a class in one call.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def stats(marks):
    low = min(marks)
    high = max(marks)
    avg = sum(marks) / len(marks)
    return low, high, round(avg, 2)

result = stats([72, 88, 95, 60, 81])
print(result)
print(type(result))

low, high, avg = stats([72, 88, 95, 60, 81])
print(f"Low={low}, High={high}, Avg={avg}")
`,
      python: {
        files: {
          "main.py": `def stats(marks):
    low = min(marks)
    high = max(marks)
    avg = sum(marks) / len(marks)
    return low, high, round(avg, 2)

result = stats([72, 88, 95, 60, 81])
print(result)
print(type(result))

low, high, avg = stats([72, 88, 95, 60, 81])
print(f"Low={low}, High={high}, Avg={avg}")
`,
        },
      },
      result: `(60, 95, 79.2)
<class 'tuple'>
Low=60, High=95, Avg=79.2`,
      explanation: "return low, high, avg packs the three values into a tuple. You can keep the tuple or unpack it straight into three variables.",
    },
    {
      title: "Function with input(): Greeting Card",
      scenario: "Read a user name and age, and use a function with a default message to build a greeting.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Type the inputs when asked: Asha, 21",
        "Compare your terminal output with the result shown below",
      ],
      code: `def greeting(name, age, message="Welcome to Python class"):
    return f"Hi {name} ({age} yrs)! {message}."

name = input("Enter name: ")
age = int(input("Enter age: "))
print()
print(greeting(name, age))
print(greeting(name, age, message="Happy learning"))
`,
      python: {
        files: {
          "main.py": `def greeting(name, age, message="Welcome to Python class"):
    return f"Hi {name} ({age} yrs)! {message}."

name = input("Enter name: ")
age = int(input("Enter age: "))
print()
print(greeting(name, age))
print(greeting(name, age, message="Happy learning"))
`,
        },
        stdin: `Asha
21
`,
      },
      result: `Enter name: Enter age: 
Hi Asha (21 yrs)! Welcome to Python class.
Hi Asha (21 yrs)! Happy learning.`,
      explanation: "The input values are passed as arguments. The second call overrides the default message using a keyword argument. Note: input() prompts are printed without a newline, so both prompts appear on the same line in the captured output.",
    },
    {
      title: "print vs return and the Hidden None",
      scenario: "Understand why a function that only prints gives None back.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def show_square(n):
    print(n * n)          # only prints

def get_square(n):
    return n * n          # gives value back

a = show_square(4)
b = get_square(4)
print("a =", a)
print("b =", b)
print("b + 1 =", b + 1)
`,
      python: {
        files: {
          "main.py": `def show_square(n):
    print(n * n)          # only prints

def get_square(n):
    return n * n          # gives value back

a = show_square(4)
b = get_square(4)
print("a =", a)
print("b =", b)
print("b + 1 =", b + 1)
`,
        },
      },
      result: `16
a = None
b = 16
b + 1 = 17`,
      explanation: "show_square prints 16 but returns nothing, so a is None. get_square returns 16 so b can be used in further calculations. Use return when the caller needs the value.",
    },
    {
      title: "Mutable Default Argument Trap",
      scenario: "A beginner writes a function to collect items in a cart and sees strange results.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def add_to_cart_bad(item, cart=[]):
    cart.append(item)
    return cart

def add_to_cart_good(item, cart=None):
    if cart is None:
        cart = []
    cart.append(item)
    return cart

print(add_to_cart_bad("pen"))
print(add_to_cart_bad("book"))     # surprise!
print(add_to_cart_good("pen"))
print(add_to_cart_good("book"))
`,
      python: {
        files: {
          "main.py": `def add_to_cart_bad(item, cart=[]):
    cart.append(item)
    return cart

def add_to_cart_good(item, cart=None):
    if cart is None:
        cart = []
    cart.append(item)
    return cart

print(add_to_cart_bad("pen"))
print(add_to_cart_bad("book"))     # surprise!
print(add_to_cart_good("pen"))
print(add_to_cart_good("book"))
`,
        },
      },
      result: `['pen']
['pen', 'book']
['pen']
['book']`,
      explanation: "The default list in the bad version is created once and shared across calls, so \"book\" is added to the same list that already has \"pen\". The good version creates a fresh list each call.",
    },
  ],
  interview: [
    {
      q: "What is a function and why do we use it?",
      a: "A function is a named, reusable block of code that performs a specific task. We use functions to avoid repetition (DRY), break big problems into small parts, make code readable, and test parts independently.",
      level: "Easy",
    },
    {
      q: "What is the difference between a parameter and an argument?",
      a: "A parameter is the variable name in the function definition (def add(a, b)). An argument is the actual value passed at call time (add(2, 3)).",
      level: "Easy",
    },
    {
      q: "What does a function return if it has no return statement?",
      a: "It returns None automatically.",
      level: "Easy",
    },
    {
      q: "What is the difference between print and return?",
      a: "print() only displays a value on the console. return sends the value back to the caller so it can be stored or used in further code. A function can print and still return None.",
      level: "Easy",
    },
    {
      q: `What is the output of this code?

def f(a, b=2, c=3):
    return a + b * c

print(f(1))
print(f(1, c=10))
print(f(c=1, a=5, b=5))
`,
      a: `Output:
7
21
10

f(1) = 1 + 2*3 = 7. f(1, c=10) = 1 + 2*10 = 21. f(c=1, a=5, b=5) = 5 + 5*1 = 10. Keyword arguments can be in any order.`,
      level: "Medium",
    },
    {
      q: `What is the output of this code?

def test():
    print("A")
    return "B"
    print("C")

x = test()
print(x)
`,
      a: `Output:
A
B

"A" is printed inside the function, then return exits with "B". The print("C") line is unreachable.`,
      level: "Easy",
    },
    {
      q: `What is the output of this code? (mutable default)

def append(n, lst=[]):
    lst.append(n)
    return lst

print(append(1))
print(append(2))
print(append(3, []))
print(append(4))
`,
      a: `Output:
[1]
[1, 2]
[3]
[1, 2, 4]

The default list is created once at definition time and shared. Calls 1, 2 and 4 share it, so it grows to [1, 2, 4]. Call 3 passes its own new list.`,
      level: "Hard",
    },
    {
      q: "Why is def f(a=1, b): a SyntaxError?",
      a: "Non-default parameters cannot follow default parameters, because Python could not know whether a positional argument is meant for a or b. Put required parameters first: def f(b, a=1).",
      level: "Medium",
    },
    {
      q: "Can a Python function return multiple values?",
      a: "Yes. return x, y returns a single tuple (x, y). The caller can unpack it: a, b = func().",
      level: "Easy",
    },
    {
      q: "What is a docstring and how can you read it?",
      a: "A docstring is a string literal written as the first statement of a function, class or module that documents it. Read it with func.__doc__ or help(func).",
      level: "Medium",
    },
  ],
  practice: [
    {
      task: "Write a function is_even(n) that returns True if n is even, else False. Print results for 4 and 7.",
      hint: "Use n % 2 == 0 and return the comparison directly.",
      solution: `def is_even(n):
    return n % 2 == 0

print(is_even(4))
print(is_even(7))
`,
    },
    {
      task: "Write a function simple_interest(p, r=8, t=1) that returns the simple interest. Call it using a default, a positional and a keyword argument.",
      hint: "SI = p * r * t / 100",
      solution: `def simple_interest(p, r=8, t=1):
    return p * r * t / 100

print(simple_interest(10000))
print(simple_interest(10000, 10))
print(simple_interest(10000, t=3))
`,
    },
    {
      task: "Write a function count_vowels(text) that returns the number of vowels in a string.",
      hint: "Loop over text.lower() and check membership in \"aeiou\".",
      solution: `def count_vowels(text):
    count = 0
    for ch in text.lower():
        if ch in "aeiou":
            count += 1
    return count

print(count_vowels("Python Full Stack"))
`,
    },
    {
      task: "Write a function grade(marks) that returns \"A\" (>=90), \"B\" (>=75), \"C\" (>=50) or \"Fail\". Test with 95, 80, 55 and 30.",
      hint: "Use if/elif/else with return in each branch.",
      solution: `def grade(marks):
    if marks >= 90:
        return "A"
    elif marks >= 75:
        return "B"
    elif marks >= 50:
        return "C"
    return "Fail"

for m in [95, 80, 55, 30]:
    print(m, grade(m))
`,
    },
    {
      task: "Write a function word_stats(sentence) that returns the number of words and the longest word as two values.",
      hint: "Use split() and max(words, key=len).",
      solution: `def word_stats(sentence):
    words = sentence.split()
    return len(words), max(words, key=len)

count, longest = word_stats("functions make python code reusable")
print(count, longest)
`,
    },
  ],
  quiz: [
    {
      question: "Which keyword is used to define a function in Python?",
      options: [
        "function",
        "def",
        "fun",
        "define",
      ],
      answer: 1,
      explanation: "Python uses def to define a function.",
    },
    {
      question: "What does a function return when it has no return statement?",
      options: [
        "0",
        "Empty string",
        "None",
        "It raises an error",
      ],
      answer: 2,
      explanation: "Python returns None implicitly.",
    },
    {
      question: "Which definition is valid?",
      options: [
        "def f(a=1, b):",
        "def f(a, b=1):",
        "def f(a=1, b, c=2):",
        "def f(=1 a):",
      ],
      answer: 1,
      explanation: "Required parameters must come before parameters with default values.",
    },
    {
      question: "What is the type of x after x = f() where f has: return 1, 2?",
      options: [
        "tuple",
        "list",
        "int",
        "dict",
      ],
      answer: 0,
      explanation: "Comma-separated return values are packed into a tuple.",
    },
    {
      question: "When is a default argument value evaluated?",
      options: [
        "Every call",
        "Only when the argument is missing",
        "When the program ends",
        "Once, when the function is defined",
      ],
      answer: 3,
      explanation: "Defaults are evaluated once at definition time, which is why mutable defaults are dangerous.",
    },
  ],
};
