export default {
  id: "day-01-introduction-to-python",
  title: "Introduction to Python: History, Features, Applications, Python 2 vs 3",
  module: "Module 1: Python Basics",
  day: 1,
  level: "Beginner",
  duration: "2 hours",
  summary: "Understand what Python is, where it came from, why it is so popular, where it is used in the real world, and why we only learn Python 3 today.",
  objectives: [
    "Explain what a programming language is and what makes Python special",
    "Describe the history of Python and who created it",
    "List the key features of Python (simple, interpreted, dynamically typed, portable, huge library)",
    "Name real-world applications of Python in web, data, AI, automation and testing",
    "Explain the main differences between Python 2 and Python 3",
  ],
  theory: [
    {
      heading: "What is Python?",
      content: "A computer only understands 0s and 1s. A programming language is a set of words and rules that lets humans give instructions to a computer in a readable way. Python is a high-level, general-purpose, interpreted programming language. \"High-level\" means it looks close to English and hides machine details like memory addresses. \"General-purpose\" means you can build almost anything with it: websites, data reports, games, automation scripts and AI models. Think of Python as a friendly translator: you speak simple English-like code, and Python translates it for the computer, line by line.",
      points: [
        "High-level: easy to read, close to English",
        "Interpreted: code runs line by line, no separate compile step for you",
        "General-purpose: web, data, AI, scripting, testing, desktop tools",
        "Open source and free: anyone can download and use it",
      ],
    },
    {
      heading: "History of Python",
      content: "Python was created by Guido van Rossum at CWI in the Netherlands. He started it as a hobby project during the Christmas holidays of 1989 and released the first version (0.9.0) in February 1991. The name does NOT come from the snake; it comes from the British comedy show \"Monty Python's Flying Circus\", because Guido wanted a short, fun name. Python 2.0 came in 2000, Python 3.0 in 2008, and Python 2 officially reached end of life on 1 January 2020. Today Python is managed by the Python Software Foundation (PSF), and new versions (3.12, 3.13 ...) come out every year.",
      points: [
        "1989: Guido van Rossum starts Python",
        "1991: First public release (0.9.0)",
        "2000: Python 2.0 (list comprehensions, garbage collection)",
        "2008: Python 3.0 (cleaner language, not backward compatible)",
        "2020: Python 2 end of life; only Python 3 is supported now",
      ],
      tip: "Interview favourite: \"Who developed Python and why is it called Python?\" Answer: Guido van Rossum, named after Monty Python's Flying Circus.",
    },
    {
      heading: "Features of Python",
      content: "Python is loved because it lets you write less code to do more work. A task that takes 10 lines in Java or C often takes 2-3 lines in Python. Here are the features every fresher should be able to explain in an interview.",
      points: [
        "Simple and easy to learn: clean syntax, uses indentation instead of curly braces",
        "Interpreted: the Python interpreter executes code line by line, so errors are easy to find",
        "Dynamically typed: you do not declare variable types; x = 10 then x = \"hi\" is allowed",
        "Object-oriented and also supports procedural and functional styles",
        "Portable (platform independent): same code runs on Windows, macOS and Linux",
        "Huge standard library (\"batteries included\"): math, datetime, json, csv, os and more",
        "Extensible and embeddable: can use C/C++ code and be embedded in other apps",
        "Large community and 500,000+ third-party packages on PyPI (pip install ...)",
        "Free and open source",
      ],
    },
    {
      heading: "Where is Python used? (Applications)",
      content: "Python is used by companies like Google, YouTube, Instagram, Netflix, Spotify, Dropbox and NASA. As a Python full stack developer you will mostly use it for web backends, but it is good to know the whole map.",
      points: [
        "Web development: Django, Flask, FastAPI (Instagram backend uses Django)",
        "Data analysis and visualization: Pandas, NumPy, Matplotlib",
        "Machine Learning and AI: scikit-learn, TensorFlow, PyTorch",
        "Automation / scripting: renaming files, sending emails, Excel reports",
        "Web scraping: requests, BeautifulSoup, Scrapy",
        "Testing and DevOps: pytest, Selenium, Ansible",
        "Desktop apps and games: Tkinter, PyQt, Pygame",
        "IoT and embedded: Raspberry Pi, MicroPython",
      ],
    },
    {
      heading: "Python 2 vs Python 3",
      content: "Python 3 was designed to fix design mistakes in Python 2. Because of this, Python 3 is not backward compatible: some Python 2 code will not run in Python 3. Python 2 is dead (no security fixes since 2020), so all new projects use Python 3. You should still know the differences because they are common interview questions.",
      syntax: `# Python 2                      # Python 3
print "Hello"                    print("Hello")
5 / 2   -> 2   (integer)         5 / 2   -> 2.5  (true division)
raw_input("Name: ")              input("Name: ")
unicode strings need u"..."      all str are Unicode by default
xrange(10)                       range(10)  (lazy, memory friendly)`,
      points: [
        "print is a statement in 2, a function in 3",
        "/ does integer division in 2 for ints, true division in 3 (use // for floor division)",
        "Strings are Unicode by default in 3",
        "input() in 3 always returns a string; raw_input() is removed",
        "Python 3 is actively developed; Python 2 is end of life",
      ],
    },
    {
      heading: "How Python runs your code",
      content: "When you run python main.py, the interpreter (CPython, written in C) first compiles your source code into bytecode (.pyc files stored in __pycache__) and then the Python Virtual Machine (PVM) executes that bytecode line by line. You do not see the compile step, which is why Python feels \"interpreted\". Analogy: you write a recipe in English (source), a helper converts it into short instruction cards (bytecode), and the chef (PVM) follows the cards one by one.",
      points: [
        "Source code (.py) -> Bytecode (.pyc) -> Python Virtual Machine -> Output",
        "CPython is the default implementation; others: PyPy (faster), Jython (Java), IronPython (.NET)",
      ],
      tip: "Common mistake: saying Python is \"only interpreted\". The accurate answer is: Python is compiled to bytecode and then interpreted by the PVM.",
    },
  ],
  examples: [
    {
      title: "Your very first Python program",
      scenario: "Print a welcome message to check that Python works. Notice: no main() function, no semicolons, no class needed.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `print("Hello, World!")
print("Welcome to Python Full Stack Development")`,
      python: {
        files: {
          "main.py": `print("Hello, World!")
print("Welcome to Python Full Stack Development")`,
        },
      },
      result: `Hello, World!
Welcome to Python Full Stack Development`,
      explanation: "print() is a built-in function that displays text on the screen. Text must be inside quotes (single or double). Each print() ends with a new line automatically. In Java the same program needs a class and a main method; in Python it is one line.",
    },
    {
      title: "Python is short and readable",
      scenario: "Add the marks of a student in 5 subjects and show total and average. Compare how little code is needed.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `marks = [78, 85, 90, 66, 88]
total = sum(marks)
average = total / len(marks)
print("Total:", total)
print("Average:", average)
print("Highest:", max(marks))`,
      python: {
        files: {
          "main.py": `marks = [78, 85, 90, 66, 88]
total = sum(marks)
average = total / len(marks)
print("Total:", total)
print("Average:", average)
print("Highest:", max(marks))`,
        },
      },
      result: `Total: 407
Average: 81.4
Highest: 90`,
      explanation: "A list holds the 5 marks. Built-in functions sum(), len() and max() do the work, so we do not write loops ourselves. This is the \"batteries included\" feature of Python.",
    },
    {
      title: "Python 3 division behaviour",
      scenario: "Show the difference between true division (/) and floor division (//), which changed from Python 2 to Python 3.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `print("5 / 2  =", 5 / 2)
print("5 // 2 =", 5 // 2)
print("10 / 5 =", 10 / 5)
print("type of 10 / 5:", type(10 / 5))`,
      python: {
        files: {
          "main.py": `print("5 / 2  =", 5 / 2)
print("5 // 2 =", 5 // 2)
print("10 / 5 =", 10 / 5)
print("type of 10 / 5:", type(10 / 5))`,
        },
      },
      result: `5 / 2  = 2.5
5 // 2 = 2
10 / 5 = 2.0
type of 10 / 5: <class 'float'>`,
      explanation: "In Python 3, / always returns a float (2.5, and even 10 / 5 gives 2.0). // returns the floor (whole number part). In Python 2, 5 / 2 gave 2, which caused many bugs, so Python 3 changed it.",
    },
    {
      title: "Check your Python version from code",
      scenario: "A program may need to know which Python version it runs on. The sys module from the standard library tells us.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `import sys

major = sys.version_info.major
minor = sys.version_info.minor
print("Running Python", str(major) + "." + str(minor))
if major >= 3:
    print("Good! This is Python 3.")
else:
    print("Please upgrade, Python 2 is end of life.")`,
      python: {
        files: {
          "main.py": `import sys

major = sys.version_info.major
minor = sys.version_info.minor
print("Running Python", str(major) + "." + str(minor))
if major >= 3:
    print("Good! This is Python 3.")
else:
    print("Please upgrade, Python 2 is end of life.")`,
        },
      },
      result: `Running Python 3.12
Good! This is Python 3.`,
      explanation: "import sys loads a standard library module. sys.version_info holds the version numbers. The output shows the version of the interpreter that ran the program (here 3.12). Notice the indentation under if/else, which you will learn on Day 3.",
    },
  ],
  interview: [
    {
      q: "What is Python?",
      a: "Python is a high-level, interpreted, general-purpose, dynamically typed programming language that supports object-oriented, procedural and functional programming. It is known for its simple, readable syntax.",
      level: "Easy",
    },
    {
      q: "Who created Python and when?",
      a: "Guido van Rossum created Python. He started in 1989 and released it publicly in 1991. It is named after the comedy show \"Monty Python's Flying Circus\".",
      level: "Easy",
    },
    {
      q: "Is Python compiled or interpreted?",
      a: "Both. CPython first compiles source code to bytecode (.pyc), then the Python Virtual Machine interprets the bytecode. Since the compile step is automatic and hidden, Python is called an interpreted language.",
      level: "Medium",
    },
    {
      q: "What does \"dynamically typed\" mean?",
      a: "The type of a variable is decided at runtime from the value assigned, and you do not declare it. x = 5 makes x an int; later x = \"five\" makes it a str.",
      level: "Easy",
    },
    {
      q: "List some key features of Python.",
      a: "Simple syntax, interpreted, dynamically typed, object-oriented, portable, large standard library, open source, huge community and third-party packages via pip, extensible with C/C++.",
      level: "Easy",
    },
    {
      q: "Give 3 differences between Python 2 and Python 3.",
      a: "1) print is a statement in 2 and a function in 3. 2) 5/2 is 2 in Python 2 but 2.5 in Python 3. 3) Strings are Unicode by default in 3. Also raw_input() became input() and xrange() became range().",
      level: "Medium",
    },
    {
      q: "What is the output of print(7 / 2, 7 // 2) in Python 3?",
      a: "3.5 3. / is true division (float) and // is floor division.",
      level: "Easy",
    },
    {
      q: "What is CPython? Name other implementations.",
      a: "CPython is the reference implementation of Python written in C, the one you download from python.org. Others: PyPy (JIT, faster), Jython (runs on JVM), IronPython (.NET), MicroPython (microcontrollers).",
      level: "Medium",
    },
    {
      q: "What is PEP 8?",
      a: "PEP 8 is the official style guide for Python code: 4-space indentation, snake_case names, max line length 79, spaces around operators etc. PEP means Python Enhancement Proposal.",
      level: "Medium",
    },
    {
      q: "What are the disadvantages of Python?",
      a: "Slower than compiled languages like C/Java, higher memory use, the GIL limits CPU-bound multithreading, weak in mobile development, and dynamic typing can hide type errors until runtime.",
      level: "Medium",
    },
  ],
  practice: [
    {
      task: "Write a program that prints your name, your city and your favourite programming language on three separate lines.",
      hint: "Use three print() calls.",
      solution: `print("Asha")
print("Pune")
print("Python")`,
    },
    {
      task: "Print the result of 17 / 5, 17 // 5 and 17 % 5 and write a comment explaining each.",
      hint: "% gives the remainder.",
      solution: `print(17 / 5)   # 3.4 true division
print(17 // 5)  # 3 floor division
print(17 % 5)   # 2 remainder`,
    },
    {
      task: "Write 5 real companies or products that use Python and what they use it for (as print statements).",
      hint: "Instagram, YouTube, Netflix, Spotify, NASA.",
      solution: `print("Instagram - Django web backend")
print("YouTube - backend services")
print("Netflix - data analysis and automation")
print("Spotify - data pipelines and recommendations")
print("NASA - scientific computing")`,
    },
    {
      task: "Find the sum, minimum and maximum of the numbers 12, 45, 7, 89, 23 using built-in functions.",
      hint: "Put them in a list and use sum(), min(), max().",
      solution: `nums = [12, 45, 7, 89, 23]
print(sum(nums), min(nums), max(nums))`,
    },
  ],
  quiz: [
    {
      question: "Who is the creator of Python?",
      options: [
        "James Gosling",
        "Guido van Rossum",
        "Dennis Ritchie",
        "Bjarne Stroustrup",
      ],
      answer: 1,
      explanation: "Guido van Rossum created Python. Gosling created Java, Ritchie created C, Stroustrup created C++.",
    },
    {
      question: "What is the output of print(9 / 3) in Python 3?",
      options: [
        "3",
        "3.0",
        "3.00",
        "Error",
      ],
      answer: 1,
      explanation: "/ always returns a float in Python 3, so 9 / 3 is 3.0.",
    },
    {
      question: "Python got its name from:",
      options: [
        "A snake species",
        "A Greek god",
        "A programming textbook",
        "The comedy show Monty Python's Flying Circus",
      ],
      answer: 3,
      explanation: "Guido named it after Monty Python's Flying Circus.",
    },
    {
      question: "Which statement about Python is TRUE?",
      options: [
        "Python is dynamically typed",
        "You must declare variable types",
        "Python uses curly braces for blocks",
        "Python 2 is still officially supported",
      ],
      answer: 0,
      explanation: "Types are decided at runtime. Blocks use indentation, and Python 2 ended in 2020.",
    },
    {
      question: "Which framework is used for web development in Python?",
      options: [
        "Pandas",
        "NumPy",
        "Django",
        "Matplotlib",
      ],
      answer: 2,
      explanation: "Django (and Flask) are web frameworks. The others are data/plotting libraries.",
    },
  ],
};
