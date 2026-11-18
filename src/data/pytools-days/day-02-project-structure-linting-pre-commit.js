export default {
  id: "day-02-project-structure-linting-pre-commit",
  title: "Professional Project Structure, Virtual Environments, Config, Linting and pre-commit",
  module: "Module 1: Developer Workflow",
  day: 2,
  level: "Beginner",
  duration: "2.5 hours",
  summary: "Set up a Python project the way professional teams do: a clean folder layout, an isolated virtual environment, pinned dependencies, configuration from environment variables, automatic linting and formatting with Ruff and Black, and pre-commit hooks that check code before every commit.",
  objectives: [
    "Organise a project using the src layout with tests, config and pyproject.toml",
    "Create and manage virtual environments and requirements files",
    "Load settings from environment variables and .env files instead of hard-coding secrets",
    "Lint and format code with Ruff and Black from the command line and pyproject.toml",
    "Install pre-commit hooks so bad code never reaches Git",
  ],
  theory: [
    {
      heading: "Why Project Structure Matters",
      content: "A clear structure helps new teammates find code quickly, makes imports predictable and lets tools (pytest, Ruff, Docker, CI) work with zero surprises. Interviewers often ask \"How do you structure a Python project?\" to check whether you have worked on real code beyond single scripts.\n\nThe modern recommendation is the **src layout**: your importable package lives inside `src/`, tests live in `tests/`, and all tool settings live in one `pyproject.toml`.",
      syntax: `student-api/
|-- src/
|   \`-- student_api/
|       |-- __init__.py
|       |-- config.py        # settings from env vars
|       |-- models.py
|       |-- services.py      # business logic
|       \`-- main.py          # entry point / app factory
|-- tests/
|   |-- conftest.py
|   \`-- test_services.py
|-- .env.example             # sample env vars (committed)
|-- .env                     # real secrets (NOT committed)
|-- .gitignore
|-- .pre-commit-config.yaml
|-- pyproject.toml
|-- requirements.txt
\`-- README.md`,
      tip: "Never name your own file after a library (random.py, flask.py, requests.py). Python will import your file instead of the real library and you get confusing errors.",
    },
    {
      heading: "Virtual Environments Recap",
      content: "A virtual environment is an isolated folder with its own Python interpreter and installed packages. Project A can use Django 4.2 while project B uses Django 5.1 on the same machine. Always activate the venv before installing packages.\n\nDependencies are recorded in `requirements.txt` (pinned versions for reproducible installs). Many teams now use **uv** (a very fast installer from Astral) or Poetry, but `venv + pip` is still the universal baseline every interviewer expects you to know.",
      syntax: `python -m venv .venv
# Windows:      .venv\\Scripts\\activate
# Linux/macOS:  source .venv/bin/activate
pip install flask python-dotenv
pip freeze > requirements.txt
pip install -r requirements.txt   # on another machine
deactivate`,
      points: [
        "Commit requirements.txt, never the .venv folder",
        "Separate dev tools: requirements-dev.txt (pytest, ruff, black, pre-commit)",
        "Check which Python is active: python -c \"import sys; print(sys.executable)\"",
      ],
    },
    {
      heading: "pyproject.toml: One File for Project Metadata and Tools",
      content: "`pyproject.toml` (PEP 518/621) is the standard place for project metadata, dependencies and tool settings. Ruff, Black, pytest, coverage and mypy all read from it, so you do not need setup.cfg, .flake8 or pytest.ini files.",
      syntax: `[project]
name = "student-api"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = ["flask>=3.0", "python-dotenv>=1.0"]

[project.optional-dependencies]
dev = ["pytest", "ruff", "black", "pre-commit"]

[tool.black]
line-length = 88

[tool.ruff]
line-length = 88
target-version = "py312"

[tool.ruff.lint]
select = ["E", "F", "I", "B", "UP"]   # pycodestyle, pyflakes, isort, bugbear, pyupgrade

[tool.pytest.ini_options]
testpaths = ["tests"]
pythonpath = ["src"]`,
    },
    {
      heading: "Configuration and Secrets: The 12-Factor Way",
      content: "Code should be the same in development, testing and production; only **configuration** changes. The 12-factor app rule is: store config (database URL, secret keys, API keys, debug flag) in **environment variables**, never hard-coded in source files.\n\nIn development you keep variables in a `.env` file and load them with `python-dotenv`. Commit a `.env.example` with dummy values so teammates know which variables exist. In production the hosting platform (Render, Docker, GitHub Actions secrets, AWS) sets real environment variables.",
      syntax: `# .env  (never commit)
DATABASE_URL=postgresql://app:secret@localhost:5432/students
SECRET_KEY=change-me
DEBUG=true

# config.py
import os
from dotenv import load_dotenv

load_dotenv()                                  # reads .env if present
DATABASE_URL = os.environ["DATABASE_URL"]      # required -> KeyError if missing
DEBUG = os.getenv("DEBUG", "false").lower() == "true"`,
      tip: "Environment variables are always strings. Convert \"true\", \"8000\" etc. to bool/int yourself, or use Pydantic Settings (Day 7) which does it automatically.",
    },
    {
      heading: "Linting and Formatting with Ruff and Black",
      content: "A **formatter** rewrites code layout (spaces, quotes, line breaks) so the whole team's code looks identical and code reviews focus on logic. **Black** is the classic \"uncompromising\" formatter.\n\nA **linter** finds bugs and bad practices: unused imports, undefined names, mutable default arguments, unsorted imports. **Ruff** (written in Rust) is extremely fast and replaces flake8, isort, pyupgrade and many plugins. Ruff also has a Black-compatible formatter (`ruff format`), so many new projects use Ruff alone.",
      syntax: `pip install ruff black
ruff check .            # report problems
ruff check . --fix      # auto-fix what is safe (e.g. unused imports, import order)
ruff format .           # Black-compatible formatting
black .                 # format with Black
black --check .         # CI mode: fail if files would change`,
      points: [
        "F401: module imported but unused",
        "F821: undefined name",
        "E501: line too long",
        "I001: imports not sorted",
        "B006: mutable default argument",
      ],
    },
    {
      heading: "pre-commit Hooks",
      content: "**pre-commit** is a framework that runs checks automatically when you type `git commit`. If Ruff finds an error or Black reformats a file, the commit is stopped; you review the change, `git add` again and commit. This keeps the main branch clean without anyone remembering to run tools manually.\n\nThe same checks also run in CI (Day 10) so nobody can skip them with `git commit --no-verify`.",
      syntax: `# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v5.0.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.8.0
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format`,
      tip: "Run pre-commit autoupdate to bump the rev values to the latest released versions of each hook.",
    },
  ],
  examples: [
    {
      title: "Reading Settings from Environment Variables",
      scenario: "Your app needs a database URL, a debug flag and a port. Values must come from environment variables with safe defaults, and invalid values must fail fast at startup.",
      steps: [
        "Create config.py and main.py in the same folder",
        "Run python main.py",
        "Then try: DEBUG=true APP_PORT=9000 python main.py (Linux/macOS) to see overridden values",
      ],
      code: `# config.py
import os
from dataclasses import dataclass


def env_bool(name, default="false"):
    return os.getenv(name, default).strip().lower() in {"1", "true", "yes"}


@dataclass(frozen=True)
class Settings:
    database_url: str
    debug: bool
    port: int


def load_settings():
    port_text = os.getenv("APP_PORT", "8000")
    if not port_text.isdigit():
        raise ValueError(f"APP_PORT must be a number, got {port_text!r}")
    return Settings(
        database_url=os.getenv("DATABASE_URL", "sqlite:///dev.db"),
        debug=env_bool("DEBUG"),
        port=int(port_text),
    )

# main.py
import os
from config import load_settings

settings = load_settings()
print(settings)

os.environ["DEBUG"] = "yes"
os.environ["APP_PORT"] = "9000"
print(load_settings())

os.environ["APP_PORT"] = "abc"
try:
    load_settings()
except ValueError as err:
    print("Startup failed:", err)`,
      python: {
        files: {
          "config.py": `import os
from dataclasses import dataclass


def env_bool(name, default="false"):
    return os.getenv(name, default).strip().lower() in {"1", "true", "yes"}


@dataclass(frozen=True)
class Settings:
    database_url: str
    debug: bool
    port: int


def load_settings():
    port_text = os.getenv("APP_PORT", "8000")
    if not port_text.isdigit():
        raise ValueError(f"APP_PORT must be a number, got {port_text!r}")
    return Settings(
        database_url=os.getenv("DATABASE_URL", "sqlite:///dev.db"),
        debug=env_bool("DEBUG"),
        port=int(port_text),
    )
`,
          "main.py": `import os
from config import load_settings

for key in ("DEBUG", "APP_PORT", "DATABASE_URL"):
    os.environ.pop(key, None)

settings = load_settings()
print(settings)

os.environ["DEBUG"] = "yes"
os.environ["APP_PORT"] = "9000"
print(load_settings())

os.environ["APP_PORT"] = "abc"
try:
    load_settings()
except ValueError as err:
    print("Startup failed:", err)
`,
        },
      },
      result: `Settings(database_url='sqlite:///dev.db', debug=False, port=8000)
Settings(database_url='sqlite:///dev.db', debug=True, port=9000)
Startup failed: APP_PORT must be a number, got 'abc'`,
      explanation: "All configuration is read in one place. Environment variables are strings, so env_bool and int() convert them. A frozen dataclass prevents accidental changes at runtime. Failing at startup with a clear message is much better than crashing later inside a request. (The runnable version first clears the three variables so the output is predictable.)",
    },
    {
      title: "Creating the src Layout from Scratch",
      scenario: "You are starting a new service and want the standard professional layout with an editable install.",
      steps: [
        "Create the folders and empty files",
        "Create and activate a venv",
        "Write pyproject.toml (from the theory section)",
        "Install the project in editable mode with dev extras",
      ],
      code: `mkdir -p student-api/src/student_api student-api/tests
cd student-api
touch src/student_api/__init__.py src/student_api/services.py
touch tests/__init__.py tests/test_services.py
touch .env.example README.md
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\\Scripts\\activate
pip install -e ".[dev]"            # installs package + dev tools
python -c "import student_api; print(student_api.__name__)"`,
      result: `Successfully installed student-api-0.1.0 ...
student_api`,
      explanation: "pip install -e installs your package in editable mode: imports point to your src folder, so code changes are visible immediately. The src layout guarantees tests import the installed package, not a random file from the current folder.",
    },
    {
      title: "Fixing Code with Ruff and Black",
      scenario: "A teammate's file has unused imports, unsorted imports, a mutable default and messy spacing.",
      steps: [
        "Save the code as messy.py",
        "Run ruff check to see problems",
        "Run ruff check --fix and black (or ruff format)",
        "Fix the remaining issue manually",
      ],
      code: `# messy.py (before)
import sys
import os, json
def add_item(item,items=[]):
    items.append( item )
    return items

$ ruff check messy.py --select E,F,I,B
messy.py:1:1: I001 Import block is un-sorted or un-formatted
messy.py:1:8: F401 \`sys\` imported but unused
messy.py:2:1: E401 Multiple imports on one line
messy.py:2:8: F401 \`os\` imported but unused
messy.py:2:12: F401 \`json\` imported but unused
messy.py:3:25: B006 Do not use mutable data structures for argument defaults

$ ruff check messy.py --fix && black messy.py

# messy.py (after manual B006 fix)
def add_item(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items`,
      result: `Found 6 errors (5 fixed, 1 remaining).
reformatted messy.py
All done! 1 file reformatted.`,
      explanation: "Ruff removed the unused imports automatically. B006 needs human judgement, so it is reported but not auto-fixed by default. Black then normalised spacing. Exact rule codes and counts can vary slightly with Ruff versions.",
    },
    {
      title: "Installing pre-commit Hooks",
      scenario: "Your team wants every commit checked automatically.",
      steps: [
        "Install pre-commit in the venv",
        "Create .pre-commit-config.yaml (see theory)",
        "Install the Git hook once per clone",
        "Run against all files, then commit as usual",
      ],
      code: `pip install pre-commit
pre-commit install
pre-commit run --all-files

git add .
git commit -m "chore: add pre-commit hooks"`,
      result: `pre-commit installed at .git/hooks/pre-commit
trim trailing whitespace.................................Passed
fix end of files.........................................Passed
check yaml...............................................Passed
check for added large files..............................Passed
ruff.....................................................Passed
ruff-format..............................................Passed`,
      explanation: "pre-commit install writes a small script into .git/hooks/pre-commit. From now on every git commit runs the hooks on staged files. If a hook modifies a file, the commit fails; git add the fixed file and commit again.",
    },
  ],
  interview: [
    { q: "How do you structure a production Python project?", a: "Use a src layout: src/<package>/ for code split into modules (config, models, services, api), tests/ for tests, pyproject.toml for metadata and tool config, requirements files or a lock file, .env.example for documented settings, .gitignore, README, and CI/pre-commit config. Business logic is kept separate from framework code so it can be tested easily.", level: "Medium" },
    { q: "Why use a virtual environment?", a: "To isolate each project's dependencies so different projects can use different package versions without conflicts, and so the exact environment can be reproduced from requirements.txt on another machine or server.", level: "Easy" },
    { q: "What is the difference between requirements.txt and pyproject.toml?", a: "requirements.txt is a list of packages, usually with pinned versions, used to reproduce an environment with pip install -r. pyproject.toml is the standard project file containing metadata, dependency ranges and tool settings (Ruff, Black, pytest). Applications often have both: pyproject for declared deps and a pinned requirements/lock file for deployment.", level: "Medium" },
    { q: "Why should secrets not be hard-coded?", a: "Hard-coded secrets end up in Git history and can leak publicly; they also force code changes to switch environments. Following the 12-factor approach, secrets come from environment variables or a secrets manager, and .env is ignored by Git.", level: "Easy" },
    { q: "What is the difference between a linter and a formatter?", a: "A formatter (Black, ruff format) only changes the layout of code without changing behaviour. A linter (Ruff, flake8, pylint) analyses code for bugs, unused variables, style violations and bad patterns, and may auto-fix some.", level: "Easy" },
    { q: "Why has Ruff become popular?", a: "It is written in Rust and is 10-100x faster than older tools, and one tool replaces flake8, isort, pyupgrade, many flake8 plugins and even Black (via ruff format). Configuration lives in pyproject.toml.", level: "Medium" },
    { q: "What is pre-commit and how does it work?", a: "pre-commit is a framework that manages Git hooks. You list hooks in .pre-commit-config.yaml; pre-commit install adds a hook script to .git/hooks. On every commit it runs the hooks on staged files in isolated environments and blocks the commit if any hook fails or changes files.", level: "Medium" },
    { q: "Can developers bypass pre-commit? How do you enforce checks then?", a: "Yes, with git commit --no-verify, or by never running pre-commit install. That is why the same lint, format-check and test commands must also run in CI on every push/PR, and branch protection should require CI to pass before merging.", level: "Hard" },
    { q: "What is the src layout and why is it recommended?", a: "Code lives in src/<package>. Because the project root is not on the import path, tests must import the installed package, which catches packaging mistakes (missing files, wrong imports) early and avoids accidentally importing local files.", level: "Hard" },
    { q: "What does pip install -e . do?", a: "It installs the project in editable (development) mode: the package is registered in the venv but points to your source folder, so code edits take effect without reinstalling.", level: "Medium" },
    { q: "How would you handle different settings for dev, test and production?", a: "Keep one settings loader that reads environment variables, with an APP_ENV variable if needed. Each environment provides its own values (local .env, CI secrets, hosting platform variables). Avoid separate hard-coded config files containing secrets; validate settings at startup (e.g. with Pydantic Settings).", level: "Hard" },
  ],
  practice: [
    {
      task: "Write a .env.example and a config.py that reads APP_NAME (default 'Shop'), DEBUG (bool, default False) and MAX_ITEMS (int, default 10). Print the values.",
      hint: "Use os.getenv with defaults and convert strings to bool and int.",
      solution: `# .env.example
APP_NAME=Shop
DEBUG=false
MAX_ITEMS=10

# config.py
import os

APP_NAME = os.getenv("APP_NAME", "Shop")
DEBUG = os.getenv("DEBUG", "false").lower() in {"1", "true", "yes"}
MAX_ITEMS = int(os.getenv("MAX_ITEMS", "10"))

if __name__ == "__main__":
    print(APP_NAME, DEBUG, MAX_ITEMS)   # Shop False 10`,
    },
    {
      task: "Create a pyproject.toml that configures Ruff with line length 100, target Python 3.12 and rules E, F, I and B, plus pytest testpaths = tests.",
      hint: "Use [tool.ruff], [tool.ruff.lint] and [tool.pytest.ini_options].",
      solution: `[project]
name = "practice-app"
version = "0.1.0"
requires-python = ">=3.12"

[tool.ruff]
line-length = 100
target-version = "py312"

[tool.ruff.lint]
select = ["E", "F", "I", "B"]

[tool.pytest.ini_options]
testpaths = ["tests"]`,
    },
    {
      task: "Run Ruff on a file that has an unused import and an f-string without placeholders. Auto-fix both and show the final code.",
      hint: "F401 is unused import, F541 is f-string without placeholders. Both are auto-fixable.",
      solution: `# before
import os
print(f"Hello")

$ ruff check demo.py --fix
Found 2 errors (2 fixed, 0 remaining).

# after
print("Hello")`,
    },
    {
      task: "Add a .pre-commit-config.yaml with trailing-whitespace, end-of-file-fixer, ruff (with --fix) and ruff-format hooks, install it and run it on all files.",
      hint: "Two repos: pre-commit/pre-commit-hooks and astral-sh/ruff-pre-commit.",
      solution: `repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v5.0.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.8.0
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format

# then
pip install pre-commit
pre-commit install
pre-commit autoupdate
pre-commit run --all-files`,
    },
  ],
  quiz: [
    { question: "Which file should be committed to Git?", options: [".env", ".venv/", "requirements.txt", "__pycache__/"], answer: 2, explanation: "requirements.txt documents dependencies; the others are local, generated or secret." },
    { question: "What does Black do?", options: ["Finds security bugs", "Formats code consistently", "Runs tests", "Creates virtual environments"], answer: 1, explanation: "Black is an opinionated code formatter; it does not change behaviour." },
    { question: "Which command installs pre-commit's Git hook into the repository?", options: ["pre-commit run", "pre-commit install", "git hooks add", "pip install hooks"], answer: 1, explanation: "pre-commit install writes .git/hooks/pre-commit so hooks run on every commit." },
    { question: "Where do Ruff, Black and pytest commonly read their settings from?", options: ["setup.py", "pyproject.toml", "README.md", "requirements.txt"], answer: 1, explanation: "Modern tools read [tool.*] sections from pyproject.toml." },
    { question: "os.getenv('PORT', '8000') returns what type?", options: ["int", "str", "float", "It depends on the value"], answer: 1, explanation: "Environment variables are always strings; convert with int() yourself." },
    { question: "Which Ruff rule family flags a mutable default argument like items=[]?", options: ["E (pycodestyle)", "I (isort)", "B (flake8-bugbear)", "UP (pyupgrade)"], answer: 2, explanation: "B006 from the bugbear rules flags mutable argument defaults." },
  ],
};
