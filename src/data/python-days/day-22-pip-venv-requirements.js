export default {
  id: "day-22-pip-venv-requirements",
  title: "pip, Virtual Environments (venv), requirements.txt",
  module: "Module 3: Functions & Modules",
  day: 22,
  level: "Intermediate",
  duration: "2 hours",
  summary: "Install third-party packages with pip, isolate each project in its own virtual environment with venv, and record exact dependencies in requirements.txt so any teammate or server can recreate the same setup.",
  objectives: [
    "Install, upgrade, list and uninstall packages with pip",
    "Create, activate and deactivate a virtual environment on Windows, macOS and Linux",
    "Create and use requirements.txt with pip freeze and pip install -r",
    "Configure VS Code and PyCharm to use a project interpreter",
    "Understand version specifiers (==, >=, ~=) and semantic versioning",
  ],
  theory: [
    {
      heading: "What is pip?",
      content: "pip is Python's package installer. It downloads packages from PyPI (the Python Package Index, pypi.org) - an online store of more than half a million free libraries such as requests, flask, django, pandas. Analogy: PyPI is the Play Store and pip is the \"Install\" button.",
      syntax: `pip --version
pip install requests
pip install django==5.0.6        # exact version
pip install --upgrade requests   # upgrade
pip show requests                # details of a package
pip list                         # all installed packages
pip uninstall requests
`,
      tip: "If pip is not found, use python -m pip install ... (or py -m pip on Windows). This guarantees pip belongs to the Python you are running.",
    },
    {
      heading: "Why Virtual Environments?",
      content: "Project A needs Django 4.2 and Project B needs Django 5.0. If you install globally, only one version can exist and projects break. A virtual environment (venv) is an isolated folder with its own Python and its own site-packages. Analogy: each project gets its own separate kitchen with its own ingredients, so cooking one dish never spoils another.",
      points: [
        "Isolates dependencies per project",
        "No admin rights needed to install packages",
        "Easy to delete and recreate",
        "Never commit the venv folder to Git - add it to .gitignore",
      ],
    },
    {
      heading: "Creating and Activating venv",
      content: "venv is built into Python 3. Create it once per project, activate it every time you open a new terminal. When active, the prompt shows (venv) and python/pip point to the environment.",
      syntax: `# create (all OS)
python -m venv venv

# activate - Windows (cmd)
venv\\Scripts\\activate
# activate - Windows (PowerShell)
venv\\Scripts\\Activate.ps1
# activate - macOS / Linux
source venv/bin/activate

# check which python is used
python -c "import sys; print(sys.prefix)"

# leave the environment
deactivate
`,
      tip: "PowerShell error \"running scripts is disabled\"? Run once: Set-ExecutionPolicy -Scope CurrentUser RemoteSigned",
    },
    {
      heading: "requirements.txt",
      content: "requirements.txt lists the packages (and versions) your project needs. pip freeze prints all installed packages in the active environment in name==version format. Commit requirements.txt to Git; teammates and servers recreate the environment with pip install -r.",
      syntax: `pip freeze > requirements.txt       # save
pip install -r requirements.txt     # restore

# requirements.txt example
Django==5.0.6
djangorestframework>=3.15,<3.16
requests~=2.32.0
python-dotenv
`,
      points: [
        "== exact version (most reproducible)",
        ">= minimum version",
        "~=2.32.0 compatible release: >=2.32.0 and <2.33",
        "No specifier: latest version (not reproducible)",
      ],
    },
    {
      heading: "IDE Setup: VS Code and PyCharm",
      content: "VS Code: open the project folder, press Ctrl+Shift+P > \"Python: Select Interpreter\" and choose ./venv. New terminals then auto-activate the venv. PyCharm: File > Settings > Project > Python Interpreter > Add Interpreter > Virtualenv Environment > New or Existing, pick the venv folder. PyCharm's terminal and Run button then use it, and you can install packages from the + button.",
      points: [
        "Semantic versioning MAJOR.MINOR.PATCH: major = breaking changes, minor = new features, patch = bug fixes",
        "Other tools you may meet: pipx, poetry, pipenv, conda, uv",
      ],
    },
  ],
  examples: [
    {
      title: "Full Workflow: New Project with venv",
      scenario: "Set up a fresh project, install packages, save and restore dependencies.",
      steps: [
        "Open a terminal in VS Code (Ctrl+`) or the PyCharm Terminal tab",
        "Run the commands one by one",
        "Check (venv) appears at the start of your prompt after activation",
        "Open requirements.txt to see the saved versions",
        "The runnable demo below checks whether Python is running inside a virtual environment",
      ],
      code: `# 1. create project folder
mkdir weather-app
cd weather-app

# 2. create & activate virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\\Scripts\\activate

# 3. install packages
python -m pip install --upgrade pip
pip install requests python-dotenv

# 4. save dependencies
pip freeze > requirements.txt

# 5. later / on another machine
git clone <repo> && cd weather-app
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 6. done working
deactivate
`,
      python: {
        files: {
          "main.py": `import sys

def in_virtualenv():
    return sys.prefix != getattr(sys, "base_prefix", sys.prefix)

status = "inside" if in_virtualenv() else "outside"
print(f"This Python is running {status} a virtual environment.")
print("Tip: activate venv and run again to see the difference.")
`,
        },
      },
      result: `This Python is running outside a virtual environment.
Tip: activate venv and run again to see the difference.`,
      explanation: "Inside an activated venv, sys.prefix points to the venv folder while sys.base_prefix points to the original Python installation - this is how tools detect a venv. The output shows \"outside\" when run with the system Python (as here); run it after activating a venv and it prints \"inside\".",
    },
    {
      title: "Parse a requirements.txt File",
      scenario: "Write a small tool that reads requirements.txt and reports which packages are pinned to an exact version.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `REQS = """# web project
Django==5.0.6
djangorestframework>=3.15,<3.16
requests~=2.32.0
python-dotenv

gunicorn==22.0.0
"""

with open("requirements.txt", "w") as f:
    f.write(REQS)

import re

def parse(path):
    result = []
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            name = re.split(r"[=<>~!]", line, maxsplit=1)[0]
            spec = line[len(name):] or "(any version)"
            result.append((name, spec))
    return result

for name, spec in parse("requirements.txt"):
    pinned = "PINNED" if spec.startswith("==") else "flexible"
    print(f"{name:<22}{spec:<16}{pinned}")
`,
      python: {
        files: {
          "main.py": `REQS = """# web project
Django==5.0.6
djangorestframework>=3.15,<3.16
requests~=2.32.0
python-dotenv

gunicorn==22.0.0
"""

with open("requirements.txt", "w") as f:
    f.write(REQS)

import re

def parse(path):
    result = []
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            name = re.split(r"[=<>~!]", line, maxsplit=1)[0]
            spec = line[len(name):] or "(any version)"
            result.append((name, spec))
    return result

for name, spec in parse("requirements.txt"):
    pinned = "PINNED" if spec.startswith("==") else "flexible"
    print(f"{name:<22}{spec:<16}{pinned}")
`,
        },
      },
      result: `Django                ==5.0.6         PINNED
djangorestframework   >=3.15,<3.16    flexible
requests              ~=2.32.0        flexible
python-dotenv         (any version)   flexible
gunicorn              ==22.0.0        PINNED`,
      explanation: "Comments and blank lines are skipped. The package name ends at the first version operator. Only == specifiers are fully reproducible; the rest are flexible and can install different versions over time.",
    },
    {
      title: "Compare Package Versions",
      scenario: "Decide if an installed version satisfies a minimum requirement - a mini version of what pip does.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def to_tuple(version):
    return tuple(int(p) for p in version.split("."))

def satisfies(installed, minimum):
    return to_tuple(installed) >= to_tuple(minimum)

checks = [("5.0.6", "4.2.0"), ("2.9.1", "2.10.0"), ("3.15.1", "3.15.1")]
for inst, need in checks:
    print(f"installed {inst} >= {need}? {satisfies(inst, need)}")

print("String compare (wrong):", "2.9.1" >= "2.10.0")
print("Tuple compare (right):", to_tuple("2.9.1") >= to_tuple("2.10.0"))
`,
      python: {
        files: {
          "main.py": `def to_tuple(version):
    return tuple(int(p) for p in version.split("."))

def satisfies(installed, minimum):
    return to_tuple(installed) >= to_tuple(minimum)

checks = [("5.0.6", "4.2.0"), ("2.9.1", "2.10.0"), ("3.15.1", "3.15.1")]
for inst, need in checks:
    print(f"installed {inst} >= {need}? {satisfies(inst, need)}")

print("String compare (wrong):", "2.9.1" >= "2.10.0")
print("Tuple compare (right):", to_tuple("2.9.1") >= to_tuple("2.10.0"))
`,
        },
      },
      result: `installed 5.0.6 >= 4.2.0? True
installed 2.9.1 >= 2.10.0? False
installed 3.15.1 >= 3.15.1? True
String compare (wrong): True
Tuple compare (right): False`,
      explanation: "Versions must be compared as numbers, not text. As strings, \"2.9.1\" looks bigger than \"2.10.0\" because \"9\" > \"1\". Converting to tuples of ints compares part by part correctly. Real tools use the packaging library for this.",
    },
    {
      title: "Simulating pip freeze with importlib.metadata",
      scenario: "See how Python knows which packages are installed (what pip freeze reads).",
      steps: [
        "Activate your venv",
        "Run pip list and pip freeze and compare the formats",
        "Create main.py with the runnable part below",
        "Run with python main.py",
      ],
      code: `# In a terminal (venv active):
pip list
pip freeze
pip show requests

# Python equivalent:
from importlib.metadata import version, distributions
print(version("pip"))
for d in distributions():
    print(d.metadata["Name"], d.version)
`,
      python: {
        files: {
          "main.py": `installed = {"Django": "5.0.6", "asgiref": "3.8.1", "sqlparse": "0.5.0", "requests": "2.32.3"}

def freeze(pkgs):
    return "\\n".join(f"{name}=={ver}" for name, ver in sorted(pkgs.items(), key=lambda x: x[0].lower()))

text = freeze(installed)
print(text)
with open("requirements.txt", "w") as f:
    f.write(text + "\\n")
print("Lines written:", len(open("requirements.txt").read().splitlines()))
`,
        },
      },
      result: `asgiref==3.8.1
Django==5.0.6
requests==2.32.3
sqlparse==0.5.0
Lines written: 4`,
      explanation: "pip freeze outputs every installed package (including dependencies like asgiref and sqlparse that Django pulled in) as name==version. The runnable demo builds the same format from a dict so it works anywhere, then writes requirements.txt.",
    },
  ],
  interview: [
    {
      q: "What is pip and what is PyPI?",
      a: "pip is the standard package installer for Python. PyPI (Python Package Index) is the public online repository from which pip downloads packages.",
      level: "Easy",
    },
    {
      q: "What is a virtual environment and why do we need it?",
      a: "An isolated Python environment with its own interpreter link and site-packages. It lets each project have its own dependency versions without conflicts and without polluting the global Python.",
      level: "Easy",
    },
    {
      q: "How do you create and activate a venv?",
      a: "python -m venv venv; then activate with venv\\Scripts\\activate on Windows or source venv/bin/activate on macOS/Linux. deactivate leaves it.",
      level: "Easy",
    },
    {
      q: "What is the difference between pip freeze and pip list?",
      a: "pip list shows installed packages in a human-readable table. pip freeze outputs them in requirements format (name==version), ready to be redirected into requirements.txt, and skips pip/setuptools tooling.",
      level: "Medium",
    },
    {
      q: "Should you commit the venv folder to Git?",
      a: "No. It is large, OS-specific and reproducible. Commit requirements.txt and add venv/ to .gitignore.",
      level: "Easy",
    },
    {
      q: "What does requests~=2.32.0 mean?",
      a: "Compatible release: any version >= 2.32.0 and < 2.33.0 (patch updates allowed).",
      level: "Medium",
    },
    {
      q: "Why is python -m pip recommended over pip?",
      a: "It guarantees the pip being used belongs to the exact python interpreter you invoke, avoiding installing into the wrong Python when several versions exist.",
      level: "Medium",
    },
    {
      q: `What is the output of this code?

print("2.9.1" > "2.10.0")
print(tuple(map(int, "2.9.1".split("."))) > tuple(map(int, "2.10.0".split("."))))
`,
      a: `Output:
True
False

String comparison goes character by character and "9" > "1", so it wrongly says True. Tuple-of-int comparison correctly says 9 < 10, so False.`,
      level: "Hard",
    },
    {
      q: "How can a Python program detect it is running inside a venv?",
      a: "Compare sys.prefix with sys.base_prefix. They differ inside a virtual environment.",
      level: "Hard",
    },
  ],
  practice: [
    {
      task: "Write the commands to create a project folder blog, create a venv, install Django 5.0.6 and save requirements.",
      hint: "mkdir, python -m venv, activate, pip install, pip freeze.",
      solution: `# shell commands
# mkdir blog && cd blog
# python -m venv venv
# source venv/bin/activate      (Windows: venv\\Scripts\\activate)
# pip install django==5.0.6
# pip freeze > requirements.txt
`,
    },
    {
      task: "Write a .gitignore suitable for a Python project with a venv.",
      hint: "Ignore venv/, __pycache__/, *.pyc, .env",
      solution: `# .gitignore
# venv/
# __pycache__/
# *.pyc
# .env
# .vscode/
# .idea/
`,
    },
    {
      task: "Write a Python function that takes a requirements string and returns only the package names (lower-case), skipping comments and blank lines.",
      hint: "Split each line at the first of = < > ~ !",
      solution: `import re
def package_names(text):
    names = []
    for line in text.splitlines():
        line = line.strip()
        if line and not line.startswith("#"):
            names.append(re.split(r"[=<>~!]", line)[0].lower())
    return names

print(package_names("Django==5.0\\n# comment\\n\\nRequests>=2.0\\nflask"))
`,
    },
    {
      task: "Write a function is_newer(a, b) returning True if version string a is newer than b. Test with (\"1.10.0\", \"1.9.9\").",
      hint: "Compare tuples of ints.",
      solution: `def is_newer(a, b):
    return tuple(map(int, a.split("."))) > tuple(map(int, b.split(".")))

print(is_newer("1.10.0", "1.9.9"))
`,
    },
  ],
  quiz: [
    {
      question: "Which command creates a virtual environment named venv?",
      options: [
        "pip install venv",
        "python -m venv venv",
        "python venv create",
        "virtual venv",
      ],
      answer: 1,
      explanation: "venv is a built-in module run with python -m venv <folder>.",
    },
    {
      question: "Which command installs all packages listed in requirements.txt?",
      options: [
        "pip install requirements.txt",
        "pip get -all",
        "pip freeze -r requirements.txt",
        "pip install -r requirements.txt",
      ],
      answer: 3,
      explanation: "-r reads requirements from a file.",
    },
    {
      question: "How do you activate a venv on macOS/Linux?",
      options: [
        "source venv/bin/activate",
        "venv\\Scripts\\activate",
        "activate venv",
        "python activate",
      ],
      answer: 0,
      explanation: "On Unix-like systems run source venv/bin/activate.",
    },
    {
      question: "What does pip freeze output?",
      options: [
        "A list of outdated packages",
        "Package names and docs",
        "Installed packages as name==version",
        "Only top-level packages",
      ],
      answer: 2,
      explanation: "freeze prints requirement specifiers for everything installed.",
    },
    {
      question: "What should be committed to Git?",
      options: [
        "The venv folder",
        "requirements.txt",
        "site-packages",
        "__pycache__",
      ],
      answer: 1,
      explanation: "Commit requirements.txt, ignore the environment folder.",
    },
  ],
};
