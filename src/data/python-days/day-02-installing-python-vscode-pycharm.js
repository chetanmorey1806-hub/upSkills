export default {
  id: "day-02-installing-python-vscode-pycharm",
  title: "Installing Python, VS Code and PyCharm Setup, First Program, Interactive Shell, Running .py Files",
  module: "Module 1: Python Basics",
  day: 2,
  level: "Beginner",
  duration: "2 hours",
  summary: "Install Python 3 on Windows, macOS or Linux, set up VS Code and PyCharm step by step, and learn the two ways of running Python: the interactive shell (REPL) and .py script files.",
  objectives: [
    "Install Python 3 correctly (with \"Add python.exe to PATH\") and verify it from the terminal",
    "Install VS Code and the Python extension, select an interpreter and run a file",
    "Install PyCharm Community, create a project with a virtual environment and run a file",
    "Use the interactive shell (REPL) to test small pieces of code",
    "Create, save and run .py files from the terminal and fix common setup errors",
  ],
  theory: [
    {
      heading: "Step 1: Install Python on Windows",
      content: "Python does not come pre-installed on Windows. Download the official installer from python.org. The single most important thing is to tick \"Add python.exe to PATH\" on the first screen; if you forget it, typing python in the terminal will not work.",
      points: [
        "1. Open https://www.python.org/downloads/ and click \"Download Python 3.12.x\" (or the latest 3.x).",
        "2. Run the downloaded .exe file.",
        "3. On the first screen TICK \"Add python.exe to PATH\" (bottom checkbox). Also keep \"Use admin privileges when installing py.exe\" ticked.",
        "4. Click \"Install Now\" and wait. If you see \"Disable path length limit\", click it (recommended).",
        "5. Click Close.",
        "6. Open Command Prompt (press Win + R, type cmd, Enter) and type: python --version. You should see Python 3.12.x.",
        "7. Also check pip (package installer): pip --version.",
      ],
      tip: "If \"python\" opens the Microsoft Store or says \"not recognized\", PATH was not set. Re-run the installer, choose \"Modify\" -> Next -> tick \"Add Python to environment variables\", or use the launcher command py instead of python.",
    },
    {
      heading: "Step 1 (other OS): Install Python on macOS and Linux",
      content: "macOS and most Linux distributions may already have a python3 command, but often an older version. On these systems the command is usually python3 (and pip3), not python.",
      points: [
        "macOS: download the macOS installer (.pkg) from python.org and run it, OR with Homebrew: brew install python@3.12",
        "macOS: after installing, double-click \"Install Certificates.command\" in the Python folder under Applications",
        "Ubuntu/Debian Linux: sudo apt update && sudo apt install python3 python3-pip python3-venv",
        "Fedora: sudo dnf install python3",
        "Verify: python3 --version and pip3 --version",
      ],
      syntax: `# Verify installation (any OS)
python --version      # Windows
python3 --version     # macOS / Linux
pip --version         # or pip3 --version`,
    },
    {
      heading: "Step 2: Set up VS Code (Visual Studio Code)",
      content: "VS Code is a free, lightweight code editor from Microsoft. By itself it is just an editor; the Python extension turns it into a Python IDE with running, debugging, auto-complete (IntelliSense) and linting.",
      points: [
        "1. Download VS Code from https://code.visualstudio.com and install it (on Windows tick \"Add to PATH\" and \"Open with Code\" options).",
        "2. Open VS Code -> click the Extensions icon on the left (or Ctrl+Shift+X).",
        "3. Search \"Python\" and install the extension published by Microsoft (it also installs Pylance and Python Debugger).",
        "4. Create a folder on your computer, e.g. python-course. In VS Code: File -> Open Folder -> select it.",
        "5. Click the New File icon in the Explorer, name it hello.py (the .py extension is important).",
        "6. Select the interpreter: press Ctrl+Shift+P -> type \"Python: Select Interpreter\" -> choose Python 3.12.",
        "7. Type print(\"Hello from VS Code\") and save with Ctrl+S.",
        "8. Run: click the Run (play) button at the top right, OR open the terminal (Ctrl+`) and type python hello.py.",
        "9. Debug: click to the left of a line number to set a red breakpoint, then press F5 -> \"Python File\".",
      ],
      tip: "Turn on File -> Auto Save so you never run an old, unsaved version of your file.",
    },
    {
      heading: "Step 3: Set up PyCharm",
      content: "PyCharm by JetBrains is a full IDE made only for Python. It has smart code completion, refactoring, a built-in debugger, test runner and database tools. Use PyCharm Community (free) or the unified PyCharm (free core features, Pro features paid; free for students).",
      points: [
        "1. Download from https://www.jetbrains.com/pycharm/download and run the installer.",
        "2. Windows options: tick \"Create Desktop Shortcut\", \"Add bin folder to PATH\", and \".py\" association. Finish and restart if asked.",
        "3. Open PyCharm -> New Project.",
        "4. Give a location, e.g. C:\\Users\\you\\PycharmProjects\\python-course.",
        "5. Interpreter type: choose \"Project venv\" (a virtual environment) and select Python 3.12 as base interpreter.",
        "6. Untick \"Create a welcome script\" if you want an empty project, click Create.",
        "7. Right-click the project folder -> New -> Python File -> name it hello (PyCharm adds .py).",
        "8. Type print(\"Hello from PyCharm\").",
        "9. Run: right-click inside the editor -> Run 'hello' (or Shift+F10 / the green play button). Output appears in the Run window at the bottom.",
        "10. Debug: click in the gutter to set a breakpoint, then right-click -> Debug 'hello'.",
      ],
      tip: "If PyCharm shows \"No Python interpreter configured\", go to File -> Settings -> Project -> Python Interpreter -> Add Interpreter and pick the installed python.exe.",
    },
    {
      heading: "The Interactive Shell (REPL)",
      content: "REPL means Read - Evaluate - Print - Loop. Type python (or python3) in a terminal and you get the >>> prompt. Every line you type is run immediately and the result is printed. It is perfect for quick experiments, like a calculator. Code typed in the REPL is not saved, so use .py files for real programs. In the REPL you do not even need print() to see a value; just typing an expression shows it.",
      syntax: `$ python
>>> 2 + 3
5
>>> name = "Asha"
>>> name.upper()
'ASHA'
>>> help(len)        # built-in help
>>> exit()           # or Ctrl+Z Enter (Windows) / Ctrl+D (macOS/Linux)`,
      points: [
        "_ (underscore) holds the last result in the REPL",
        "IDLE (installed with Python on Windows/macOS) is a simple editor + REPL",
        "VS Code: Ctrl+Shift+P -> \"Python: Start REPL\"; PyCharm: Tools -> Python Console",
      ],
    },
    {
      heading: "Running .py files and common errors",
      content: "A script is a text file ending in .py. Open a terminal in the folder where the file is saved and type python filename.py. Python reads the file from top to bottom and runs every line. Most beginner errors are about the folder (wrong current directory) or the command name.",
      points: [
        "\"python: can't open file ... No such file or directory\" -> you are in the wrong folder. Use cd to go to the folder, and dir (Windows) / ls (macOS/Linux) to list files.",
        "\"python is not recognized\" -> PATH not set (re-run installer) or use py / python3.",
        "File saved as hello.py.txt -> turn on \"File name extensions\" in Windows Explorer.",
        "SyntaxError when typing python hello.py INSIDE the >>> shell -> exit the REPL first; that command belongs to the terminal.",
        "python -m pip install package installs packages for that exact Python.",
      ],
    },
  ],
  examples: [
    {
      title: "Install check commands (terminal)",
      scenario: "After installing Python, VS Code and PyCharm, verify everything from the terminal before writing code.",
      steps: [
        "Windows: press Win + R, type cmd, press Enter (macOS: open Terminal app)",
        "Type each command and press Enter",
        "Compare your output with the expected output",
        "If a command is \"not recognized\", fix PATH as explained in the theory",
      ],
      code: `python --version
pip --version
where python        # Windows (macOS/Linux: which python3)
code --version      # VS Code command line, if added to PATH`,
      result: `Python 3.12.3
pip 24.0 from C:\\Users\\you\\AppData\\Local\\Programs\\Python\\Python312\\Lib\\site-packages\\pip (python 3.12)
C:\\Users\\you\\AppData\\Local\\Programs\\Python\\Python312\\python.exe
1.95.0`,
      explanation: "Exact version numbers and paths will differ on your machine. What matters is that every command prints a version and does not say \"not recognized\". On macOS/Linux use python3 and pip3.",
    },
    {
      title: "First program: hello.py",
      scenario: "Create your first script in VS Code or PyCharm and run it.",
      steps: [
        "VS Code: File -> Open Folder -> python-course; New File -> hello.py",
        "PyCharm: New Project (Project venv) -> right-click project -> New -> Python File -> hello",
        "Type the code and save (Ctrl+S)",
        "Run: VS Code play button or terminal \"python hello.py\"; PyCharm Shift+F10 or right-click -> Run 'hello'",
      ],
      code: `# hello.py - my first Python program
print("Hello, World!")
print("Python is installed and working.")
print("2 + 3 =", 2 + 3)`,
      python: {
        files: {
          "main.py": `# hello.py - my first Python program
print("Hello, World!")
print("Python is installed and working.")
print("2 + 3 =", 2 + 3)`,
        },
      },
      result: `Hello, World!
Python is installed and working.
2 + 3 = 5`,
      explanation: "Lines starting with # are comments and are ignored. print() can show text and numbers; separate values with commas and Python adds a space between them. Python evaluates 2 + 3 before printing.",
    },
    {
      title: "Program that talks to the user",
      scenario: "Ask the user for their name and favourite IDE and greet them. Running a script that reads input proves your terminal setup works end to end.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `name = input("What is your name? ")
ide = input("Which IDE are you using? ")
print("Hello", name + "!")
print("Great choice,", ide, "is a good editor for Python.")`,
      python: {
        files: {
          "main.py": `name = input("What is your name? ")
ide = input("Which IDE are you using? ")
print("Hello", name + "!")
print("Great choice,", ide, "is a good editor for Python.")`,
        },
        stdin: `Asha
VS Code
`,
      },
      result: `What is your name? Which IDE are you using? Hello Asha!
Great choice, VS Code is a good editor for Python.`,
      explanation: "input() shows a prompt and waits for the user to type and press Enter. Here the inputs Asha and VS Code were typed. In the real terminal you would see your typed text after each prompt; the captured output shows only what the program prints.",
    },
    {
      title: "Interactive shell vs script",
      scenario: "In the REPL, typing an expression shows its value. In a .py file, nothing is shown unless you print it.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `# In the REPL, ">>> 10 * 5" shows 50 automatically.
# In a script, a bare expression shows NOTHING:
10 * 5
# You must use print() to see values in a script:
print(10 * 5)
print(len("PyCharm"))
print("vs" + "code")`,
      python: {
        files: {
          "main.py": `# In the REPL, ">>> 10 * 5" shows 50 automatically.
# In a script, a bare expression shows NOTHING:
10 * 5
# You must use print() to see values in a script:
print(10 * 5)
print(len("PyCharm"))
print("vs" + "code")`,
        },
      },
      result: `50
7
vscode`,
      explanation: "The line 10 * 5 is calculated but not displayed because scripts only show what you print. This is a very common beginner confusion when moving from the >>> shell to a file.",
    },
    {
      title: "Find where your Python lives",
      scenario: "When VS Code or PyCharm uses the wrong Python, print the path of the interpreter that is running your code and compare it with the interpreter selected in the IDE.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `import sys
import platform

print("Python version:", platform.python_version())
print("Major version is 3:", sys.version_info.major == 3)
print("Interpreter path ends with:", sys.executable.split("/")[-1].split("\\\\")[-1])`,
      python: {
        files: {
          "main.py": `import sys
import platform

print("Python version:", platform.python_version())
print("Major version is 3:", sys.version_info.major == 3)
print("Interpreter path ends with:", sys.executable.split("/")[-1].split("\\\\")[-1])`,
        },
      },
      result: `Python version: 3.12.3
Major version is 3: True
Interpreter path ends with: python3`,
      explanation: "sys.executable is the full path of the running interpreter (for example C:\\...\\Python312\\python.exe or a .venv path). If it is not the one you expect, change it with \"Python: Select Interpreter\" (VS Code) or Settings -> Python Interpreter (PyCharm).",
    },
  ],
  interview: [
    {
      q: "What is PATH and why do we tick \"Add python.exe to PATH\" during installation?",
      a: "PATH is an environment variable listing folders where the OS searches for commands. Adding Python to PATH lets you type python in any terminal folder. Without it you get \"python is not recognized\".",
      level: "Easy",
    },
    {
      q: "What is the difference between an IDE and a code editor?",
      a: "A code editor (VS Code) is lightweight and becomes IDE-like with extensions. An IDE (PyCharm) has built-in run, debug, refactoring, testing, and project/virtualenv management out of the box.",
      level: "Easy",
    },
    {
      q: "What is REPL?",
      a: "Read-Evaluate-Print-Loop: the interactive Python shell (>>> prompt) that reads one statement, evaluates it, prints the result and waits for the next.",
      level: "Easy",
    },
    {
      q: "How do you run a Python file from the terminal?",
      a: "Go to the folder with cd, then run python filename.py (python3 on macOS/Linux, or py filename.py on Windows).",
      level: "Easy",
    },
    {
      q: "What is pip?",
      a: "pip is the package installer for Python. It downloads packages from PyPI: pip install requests. Use python -m pip to be sure it installs into the Python you are running.",
      level: "Easy",
    },
    {
      q: "What is a virtual environment and why does PyCharm create one for a new project?",
      a: "A virtual environment (venv) is an isolated folder with its own Python interpreter and packages. Each project can have different package versions without conflicts. PyCharm creates .venv by default.",
      level: "Medium",
    },
    {
      q: "What happens if you type 5 + 5 in a .py file and run it?",
      a: "Nothing is shown. The expression is evaluated but not printed. Only the REPL auto-displays expression values; scripts need print().",
      level: "Medium",
    },
    {
      q: "How do you exit the Python shell?",
      a: "Type exit() or quit(), or press Ctrl+Z then Enter on Windows, Ctrl+D on macOS/Linux.",
      level: "Easy",
    },
    {
      q: "What is the purpose of the __pycache__ folder?",
      a: "It stores compiled bytecode (.pyc) of imported modules so Python can skip recompiling them next time, making startup faster. It is safe to delete.",
      level: "Medium",
    },
    {
      q: "You installed a package with pip but import fails in VS Code. Why?",
      a: "VS Code is using a different interpreter than the pip you used. Select the correct interpreter (Python: Select Interpreter) or install with that interpreter: python -m pip install package.",
      level: "Hard",
    },
  ],
  practice: [
    {
      task: "Install Python and run python --version. Then create intro.py that prints your name, your college and today's goal.",
      hint: "Three print() calls; run with python intro.py.",
      solution: `print("Name: Asha")
print("College: ABC Engineering")
print("Goal: Run my first Python program")`,
    },
    {
      task: "Open the REPL and calculate 1234 * 5678, then use _ to add 100 to the result.",
      hint: "_ holds the last value in the REPL.",
      solution: `>>> 1234 * 5678
7006652
>>> _ + 100
7006752`,
    },
    {
      task: "Write a script that asks for two numbers and prints their sum. Run it in both VS Code and PyCharm.",
      hint: "input() returns text; convert with int().",
      solution: `a = int(input("First number: "))
b = int(input("Second number: "))
print("Sum =", a + b)`,
    },
    {
      task: "Write a script that prints the Python version using the platform module.",
      hint: "import platform; platform.python_version()",
      solution: `import platform
print("You are using Python", platform.python_version())`,
    },
  ],
  quiz: [
    {
      question: "Which checkbox is most important while installing Python on Windows?",
      options: [
        "Install for all users",
        "Add python.exe to PATH",
        "Download debug binaries",
        "Precompile standard library",
      ],
      answer: 1,
      explanation: "Without PATH the python command is not recognized in the terminal.",
    },
    {
      question: "Which command runs the file app.py?",
      options: [
        "run app.py",
        "python -run app.py",
        "python app.py",
        "start python app",
      ],
      answer: 2,
      explanation: "python filename.py runs a script (python3 on macOS/Linux).",
    },
    {
      question: "In VS Code, which command lets you choose the Python version used?",
      options: [
        "Python: Select Interpreter",
        "Python: Install",
        "Terminal: Select Python",
        "View: Python Path",
      ],
      answer: 0,
      explanation: "Ctrl+Shift+P -> Python: Select Interpreter.",
    },
    {
      question: "What does the >>> symbol indicate?",
      options: [
        "A comment",
        "A syntax error",
        "Output of print()",
        "The interactive Python shell prompt",
      ],
      answer: 3,
      explanation: ">>> is the REPL prompt waiting for input.",
    },
    {
      question: "Which keyboard shortcut runs the current file in PyCharm?",
      options: [
        "Ctrl+R",
        "F12",
        "Shift+F10",
        "Alt+Enter",
      ],
      answer: 2,
      explanation: "Shift+F10 runs the current run configuration in PyCharm (Windows/Linux).",
    },
  ],
};
