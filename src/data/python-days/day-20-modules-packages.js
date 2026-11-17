export default {
  id: "day-20-modules-packages",
  title: "Modules and Packages, import styles, __name__ == \"__main__\"",
  module: "Module 3: Functions & Modules",
  day: 20,
  level: "Intermediate",
  duration: "2 hours",
  summary: "Split programs into modules (.py files) and packages (folders with __init__.py), use every import style correctly, and use the if __name__ == \"__main__\" guard to write files that work both as scripts and as importable modules.",
  objectives: [
    "Create and import your own modules",
    "Use import, from-import, aliases (as) and know why to avoid import *",
    "Build a package with __init__.py and sub-modules",
    "Explain __name__ and the if __name__ == \"__main__\" guard",
    "Understand how Python finds modules (sys.path) and module caching",
  ],
  theory: [
    {
      heading: "What is a Module?",
      content: "A module is simply a .py file that contains functions, classes and variables. Any Python file can be imported by another file. Analogy: a module is like one drawer in a toolbox - the \"math tools\" drawer, the \"string tools\" drawer. You open the drawer you need instead of carrying every tool everywhere.",
      points: [
        "Built-in / standard modules: math, random, datetime, os ...",
        "Third-party modules: installed with pip (requests, pandas)",
        "User-defined modules: your own .py files",
      ],
    },
    {
      heading: "Import Styles",
      content: "Python offers several ways to import. Choose the clearest one.",
      syntax: `import math                     # use as math.sqrt(16)
import math as m                # alias: m.sqrt(16)
from math import sqrt, pi       # use directly: sqrt(16)
from math import sqrt as root   # alias for a name
from math import *              # imports all public names - avoid!
`,
      points: [
        "import module keeps names namespaced and avoids clashes",
        "from-import is shorter for frequently used names",
        "import * pollutes your namespace and hides where names came from",
        "Put imports at the top of the file (PEP 8): standard library, then third-party, then your own modules",
      ],
    },
    {
      heading: "Packages",
      content: "A package is a folder of modules. A regular package contains an __init__.py file (it can be empty), which runs when the package is first imported and can expose a clean public API. Packages can contain sub-packages. Inside a package you can use relative imports such as from . import utils or from .models import Product.",
      syntax: `shop/
    __init__.py
    billing.py
    inventory.py
main.py

# main.py
from shop import billing
from shop.inventory import stock_of
`,
      tip: "Do not name your file the same as a standard module (random.py, math.py, json.py) - your file will be imported instead of the real one.",
    },
    {
      heading: "__name__ and the Main Guard",
      content: "Every module has a built-in variable __name__. When a file is run directly (python utils.py), its __name__ is \"__main__\". When it is imported, __name__ is the module name (\"utils\"). Code inside if __name__ == \"__main__\": runs only when the file is executed directly - perfect for tests or a demo that should not run on import.",
      syntax: `def add(a, b):
    return a + b

if __name__ == "__main__":
    print(add(2, 3))     # runs only with: python utils.py
`,
    },
    {
      heading: "How Python Finds Modules",
      content: "On import, Python first checks sys.modules (a cache of already loaded modules - a module body runs only once per program), then searches the folders in sys.path: the script's folder, PYTHONPATH, the standard library and site-packages. dir(module) lists names in a module and help(module) shows documentation. importlib.reload(module) re-runs a module during development.",
    },
  ],
  examples: [
    {
      title: "Your First Module",
      scenario: "Keep reusable calculator functions in calc.py and use them from main.py.",
      steps: [
        "Open VS Code or PyCharm and create a new folder",
        "Create calc.py and paste its code",
        "Create main.py and paste its code",
        "Run the program with: python main.py",
        "Compare the output with the result below",
      ],
      code: `# ---------- calc.py ----------
"""calc.py - simple calculator helpers"""
PI = 3.14159

def add(a, b):
    return a + b

def area_of_circle(r):
    return round(PI * r * r, 2)

print("calc module loaded, __name__ =", __name__)

if __name__ == "__main__":
    print("Testing calc directly:", add(2, 3))

# ---------- main.py ----------
import calc
import calc as c          # already cached - module body does not run again
from calc import add, area_of_circle as area

print(calc.add(10, 5))
print(c.PI)
print(add(1, 2))
print(area(7))
print("main __name__ =", __name__)
`,
      python: {
        files: {
          "calc.py": `"""calc.py - simple calculator helpers"""
PI = 3.14159

def add(a, b):
    return a + b

def area_of_circle(r):
    return round(PI * r * r, 2)

print("calc module loaded, __name__ =", __name__)

if __name__ == "__main__":
    print("Testing calc directly:", add(2, 3))
`,
          "main.py": `import calc
import calc as c          # already cached - module body does not run again
from calc import add, area_of_circle as area

print(calc.add(10, 5))
print(c.PI)
print(add(1, 2))
print(area(7))
print("main __name__ =", __name__)
`,
        },
      },
      result: `calc module loaded, __name__ = calc
15
3.14159
3
153.94
main __name__ = __main__`,
      explanation: "When main.py imports calc, calc's top-level code runs once and its __name__ is \"calc\", so the main-guard block is skipped. The second import uses the cached module, so the \"loaded\" line appears only once. main.py is the script being run, so its __name__ is \"__main__\".",
    },
    {
      title: "The __main__ Guard in Practice",
      scenario: "A utility file has demo code that should run only when executed directly, not when imported.",
      steps: [
        "Open VS Code or PyCharm and create a new folder",
        "Create textutils.py and paste its code",
        "Create main.py and paste its code",
        "Run the program with: python main.py",
        "Compare the output with the result below",
      ],
      code: `# ---------- textutils.py ----------
def word_count(text):
    return len(text.split())

def title_case(text):
    return " ".join(w.capitalize() for w in text.split())

def _demo():
    print("DEMO:", title_case("hello world"))

if __name__ == "__main__":
    _demo()

# ---------- main.py ----------
import textutils

sentence = "python modules keep code organised"
print(textutils.word_count(sentence))
print(textutils.title_case(sentence))

# simulate running textutils directly
import runpy
runpy.run_module("textutils", run_name="__main__")
`,
      python: {
        files: {
          "textutils.py": `def word_count(text):
    return len(text.split())

def title_case(text):
    return " ".join(w.capitalize() for w in text.split())

def _demo():
    print("DEMO:", title_case("hello world"))

if __name__ == "__main__":
    _demo()
`,
          "main.py": `import textutils

sentence = "python modules keep code organised"
print(textutils.word_count(sentence))
print(textutils.title_case(sentence))

# simulate running textutils directly
import runpy
runpy.run_module("textutils", run_name="__main__")
`,
        },
      },
      result: `5
Python Modules Keep Code Organised
DEMO: Hello World`,
      explanation: "Importing textutils does not print DEMO because the guard is False. runpy.run_module(..., run_name=\"__main__\") executes the file as if you typed python textutils.py, so the demo runs. A leading underscore (_demo) signals \"internal helper\".",
    },
    {
      title: "Building a Package with __init__.py",
      scenario: "Create a shop package with billing and inventory modules and a clean public API.",
      steps: [
        "Open VS Code or PyCharm and create a folder",
        "Create a sub-folder named shop with __init__.py, billing.py and inventory.py",
        "Create main.py next to the shop folder",
        "Run: python main.py",
        "The runnable version below creates the same package files from code so it also works in the browser lab",
      ],
      code: `# Project structure
# shop/
#     __init__.py
#     billing.py
#     inventory.py
# main.py

# ---------- shop/billing.py ----------
GST = 0.18
def total(price, qty):
    return round(price * qty * (1 + GST), 2)

# ---------- shop/inventory.py ----------
STOCK = {"pen": 50, "book": 12}
def stock_of(item):
    return STOCK.get(item, 0)

# ---------- shop/__init__.py ----------
from .billing import total          # relative import
from .inventory import stock_of
__all__ = ["total", "stock_of"]
print("shop package initialised")

# ---------- main.py ----------
import shop
from shop.billing import GST
from shop import inventory

print(shop.total(100, 3))
print(shop.stock_of("pen"), inventory.stock_of("bag"))
print("GST:", GST)
`,
      python: {
        files: {
          "main.py": `import os, sys, importlib

files = {
    "shop/billing.py": "GST = 0.18\\ndef total(price, qty):\\n    return round(price * qty * (1 + GST), 2)\\n",
    "shop/inventory.py": "STOCK = {'pen': 50, 'book': 12}\\ndef stock_of(item):\\n    return STOCK.get(item, 0)\\n",
    "shop/__init__.py": "from .billing import total\\nfrom .inventory import stock_of\\n__all__ = ['total', 'stock_of']\\nprint('shop package initialised')\\n",
}
os.makedirs("shop", exist_ok=True)
for path, text in files.items():
    with open(path, "w") as f:
        f.write(text)
sys.path.insert(0, os.getcwd())
importlib.invalidate_caches()

import shop
from shop.billing import GST
from shop import inventory

print(shop.total(100, 3))
print(shop.stock_of("pen"), inventory.stock_of("bag"))
print("GST:", GST)
print(sorted(n for n in dir(shop) if not n.startswith("_")))
`,
        },
      },
      result: `shop package initialised
354.0
50 0
GST: 0.18
['billing', 'inventory', 'stock_of', 'total']`,
      explanation: "Importing shop runs shop/__init__.py once, which pulls total and stock_of up to the package level using relative imports. You can still import sub-modules directly (shop.billing). dir(shop) shows the sub-modules and the names exposed by __init__.py.",
    },
    {
      title: "Exploring Modules: dir, sys.modules and import *",
      scenario: "Inspect what a module provides and see why import * is risky.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import math
import sys

print([n for n in dir(math) if n.startswith("f")])
print("math" in sys.modules)

pi = "my pie"
from math import *        # silently overwrites pi!
print(pi)

import math as m
print(m is math)          # same cached module object
print(math.__name__)
`,
      python: {
        files: {
          "main.py": `import math
import sys

print([n for n in dir(math) if n.startswith("f")])
print("math" in sys.modules)

pi = "my pie"
from math import *        # silently overwrites pi!
print(pi)

import math as m
print(m is math)          # same cached module object
print(math.__name__)
`,
        },
      },
      result: `['fabs', 'factorial', 'floor', 'fmod', 'frexp', 'fsum']
True
3.141592653589793
True
math`,
      explanation: "dir() lists names in a module. sys.modules caches loaded modules, so math and m are the very same object. from math import * replaced our own pi variable without warning - the reason PEP 8 discourages wildcard imports.",
    },
  ],
  interview: [
    {
      q: "What is the difference between a module and a package?",
      a: "A module is a single .py file. A package is a directory of modules (traditionally with an __init__.py) that can contain sub-packages, used to organise related modules.",
      level: "Easy",
    },
    {
      q: "What is the purpose of __init__.py?",
      a: "It marks a directory as a regular package and runs when the package is first imported. It can be empty or can import names to expose a public API and define __all__.",
      level: "Medium",
    },
    {
      q: "What does if __name__ == \"__main__\": do?",
      a: "It runs the block only when the file is executed directly. When the file is imported, __name__ is the module name, so the block is skipped. It is used for demos, tests and script entry points.",
      level: "Easy",
    },
    {
      q: "Why should you avoid from module import *?",
      a: "It dumps many names into your namespace, can silently overwrite existing names, and makes it unclear where a name came from. Linters also cannot detect undefined names reliably.",
      level: "Medium",
    },
    {
      q: "If a module is imported twice, does its code run twice?",
      a: "No. After the first import it is cached in sys.modules, and later imports reuse the cached object. Use importlib.reload() to force re-execution.",
      level: "Medium",
    },
    {
      q: "What is the output when main.py runs? (helper.py contains: print(\"helper\", __name__))",
      a: `Output:
helper helper
main __main__

main.py code:
import helper
print("main", __name__)

The imported module's __name__ is its module name; the executed script's __name__ is "__main__".`,
      level: "Easy",
    },
    {
      q: `What is the output of this code?

import math as m
from math import sqrt
print(m.sqrt(16) == sqrt(16), m.floor(-2.5), m.ceil(-2.5))
`,
      a: `Output:
True -3 -2

Both names refer to the same function, so 4.0 == 4.0 is True. floor rounds down to -3 and ceil rounds up to -2.`,
      level: "Medium",
    },
    {
      q: "How does Python find a module during import?",
      a: "It checks sys.modules first, then searches each folder in sys.path in order: the script directory, PYTHONPATH entries, the standard library, and site-packages.",
      level: "Medium",
    },
    {
      q: "What is the difference between absolute and relative imports?",
      a: "Absolute imports use the full path from the project root (from shop.billing import total). Relative imports use dots relative to the current package (from .billing import total) and only work inside packages.",
      level: "Hard",
    },
    {
      q: "What goes wrong if you name your file random.py and do import random?",
      a: "Python finds your random.py in the script folder first (sys.path order), so your file is imported instead of the standard library, causing AttributeError such as module random has no attribute randint.",
      level: "Medium",
    },
  ],
  practice: [
    {
      task: "Create a module greetings.py with functions hello(name) and bye(name). Import it in main.py using three different import styles.",
      hint: "import greetings, import greetings as g, from greetings import hello.",
      solution: `# greetings.py
def hello(name):
    return f"Hello, {name}"

def bye(name):
    return f"Bye, {name}"

# main.py
import greetings
import greetings as g
from greetings import hello

print(greetings.hello("Asha"))
print(g.bye("Asha"))
print(hello("Ravi"))
`,
    },
    {
      task: "Add a main guard to a module mathx.py that has square(n). When run directly it should print square(5); when imported it should print nothing.",
      hint: "if __name__ == \"__main__\": print(square(5))",
      solution: `# mathx.py
def square(n):
    return n * n

if __name__ == "__main__":
    print(square(5))
`,
    },
    {
      task: "Design a package college with modules students.py and fees.py, and an __init__.py that exposes add_student and fee_for.",
      hint: "Use relative imports in __init__.py.",
      solution: `# college/students.py
STUDENTS = []
def add_student(name):
    STUDENTS.append(name)
    return len(STUDENTS)

# college/fees.py
FEES = {"python": 15000, "django": 20000}
def fee_for(course):
    return FEES.get(course, 0)

# college/__init__.py
from .students import add_student
from .fees import fee_for

# main.py
from college import add_student, fee_for
print(add_student("Asha"), fee_for("python"))
`,
    },
    {
      task: "Print all names in the random module that start with \"rand\" and print whether \"random\" is in sys.modules after importing it.",
      hint: "Use dir(random) and a list comprehension.",
      solution: `import random, sys
print([n for n in dir(random) if n.startswith("rand")])
print("random" in sys.modules)
`,
    },
  ],
  quiz: [
    {
      question: "What is the value of __name__ in a file that is run directly?",
      options: [
        "The file name",
        "\"__main__\"",
        "None",
        "\"main\"",
      ],
      answer: 1,
      explanation: "The executed script always has __name__ == \"__main__\".",
    },
    {
      question: "Which statement imports only sqrt from math?",
      options: [
        "import sqrt from math",
        "import math.sqrt",
        "from math import sqrt",
        "using math.sqrt",
      ],
      answer: 2,
      explanation: "from module import name is the syntax.",
    },
    {
      question: "Which file traditionally marks a folder as a Python package?",
      options: [
        "__init__.py",
        "__main__.py",
        "setup.py",
        "package.json",
      ],
      answer: 0,
      explanation: "__init__.py runs when the package is imported.",
    },
    {
      question: "Where are already-imported modules cached?",
      options: [
        "sys.path",
        "os.environ",
        "__builtins__",
        "sys.modules",
      ],
      answer: 3,
      explanation: "sys.modules maps module names to loaded module objects.",
    },
    {
      question: "What does \"from . import utils\" mean?",
      options: [
        "Import utils from the standard library",
        "Import utils from the current package",
        "Import everything",
        "A syntax error",
      ],
      answer: 1,
      explanation: "A single dot is a relative import from the current package.",
    },
  ],
};
