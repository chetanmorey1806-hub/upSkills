export default {
  id: "extra-09-sys-argparse-cli-apps",
  title: "sys, argparse and Building Command-Line (CLI) Apps",
  module: "Module 2: Standard Library Power Tools",
  extraNo: 9,
  level: "Intermediate",
  duration: "2.5 hours",
  summary: "Turn Python scripts into professional command-line tools. Learn the sys module (argv, exit codes, stdin/stdout/stderr, path, version), then build CLIs with argparse: positional and optional arguments, types, choices, defaults, flags, nargs, mutually exclusive groups and sub-commands like git. Finish with the __main__ pattern and entry points.",
  objectives: [
    "Read raw command-line arguments with sys.argv and exit with proper status codes",
    "Use sys.stdin, sys.stdout and sys.stderr for pipe-friendly scripts",
    "Build a CLI with argparse: positional/optional args, type, choices, default, action",
    "Create sub-commands (like git commit / git push) with add_subparsers",
    "Structure a CLI with main() and if __name__ == '__main__'",
  ],
  theory: [
    {
      heading: "The sys Module",
      content: `\`sys\` gives access to the Python interpreter itself. Most useful items:

\`sys.argv\` - list of command-line arguments; \`argv[0]\` is the script name. \`sys.exit(code)\` - stop the program with an exit status (0 = success, non-zero = error); \`sys.exit("message")\` prints the message to stderr and exits with 1. \`sys.stdin\`, \`sys.stdout\`, \`sys.stderr\` - standard streams. \`sys.path\` - folders Python searches for imports. \`sys.version\` / \`sys.version_info\` - Python version. \`sys.platform\` - 'linux', 'win32', 'darwin'. \`sys.getsizeof(obj)\` - memory size of an object. \`sys.getrecursionlimit()\` - maximum recursion depth (default 1000).`,
      syntax: `import sys
# python greet.py Asha 25
print(sys.argv)          # ['greet.py', 'Asha', '25']
if sys.version_info < (3, 10):
    sys.exit("Python 3.10+ required")
`,
    },
    {
      heading: "Standard Streams and Exit Codes",
      content: `Command-line programs talk to the world through three streams: **stdin** (input, keyboard or pipe), **stdout** (normal output) and **stderr** (errors and diagnostics). Keeping errors on stderr means \`python app.py > out.txt\` captures only real output while errors still appear on the screen.

The exit code tells the shell or CI pipeline whether the program succeeded: \`echo $?\` (Linux) or \`echo %ERRORLEVEL%\` (Windows) shows it. Conventions: 0 success, 1 general error, 2 command-line usage error (argparse uses 2).`,
      syntax: `print("result", file=sys.stdout)
print("warning: file missing", file=sys.stderr)
for line in sys.stdin:          # read piped input: cat data.txt | python app.py
    process(line.rstrip("\\n"))
`,
    },
    {
      heading: "argparse Basics",
      content: `Parsing \`sys.argv\` manually quickly becomes messy. \`argparse\` (standard library) parses arguments, converts types, validates values, and generates \`--help\` and error messages automatically.

Steps: create an \`ArgumentParser\`, add arguments with \`add_argument()\`, call \`parse_args()\`, and read values as attributes of the returned Namespace. **Positional** arguments are required and identified by position (\`filename\`). **Optional** arguments start with \`-\` or \`--\` (\`--limit\`, \`-v\`); dashes in names become underscores in the namespace (\`--dry-run\` -> \`args.dry_run\`).`,
      syntax: `import argparse
parser = argparse.ArgumentParser(description="Sales report tool")
parser.add_argument("file", help="CSV file to read")
parser.add_argument("-n", "--top", type=int, default=5, help="rows to show")
parser.add_argument("--format", choices=["table", "json"], default="table")
parser.add_argument("-v", "--verbose", action="store_true")
args = parser.parse_args()      # reads sys.argv[1:]
args.file, args.top, args.verbose
`,
    },
    {
      heading: "Useful add_argument Options",
      content: "add_argument has many options that remove manual validation code:",
      points: [
        "type=int / float / pathlib.Path / custom function - converts and validates",
        "default=value - used when the option is missing",
        "required=True - makes an optional (--flag) argument mandatory",
        "choices=[...] - restricts allowed values",
        "action='store_true' / 'store_false' - boolean flags",
        "action='count' - counts repeats, e.g. -vvv gives 3",
        "action='append' - collect repeated options into a list",
        "nargs='+' (one or more), '*' (zero or more), '?' (optional single), N (exactly N)",
        "dest='name' and metavar='FILE' - control attribute name and help text",
        "action='version', version='%(prog)s 1.0' - adds --version",
      ],
      tip: "Use `parse_args([...list...])` with an explicit list in tests or notebooks; without arguments it reads the real sys.argv.",
    },
    {
      heading: "Sub-commands and Mutually Exclusive Groups",
      content: `Tools like git, pip and docker have sub-commands (\`git commit\`, \`pip install\`). argparse supports this with \`parser.add_subparsers(dest="command", required=True)\`; each sub-parser has its own arguments. A common trick is \`sub.set_defaults(func=handler)\` so you can call \`args.func(args)\` after parsing.

\`add_mutually_exclusive_group()\` makes options that cannot be used together, e.g. \`--json\` and \`--csv\`. Argument groups (\`add_argument_group\`) only organise the help text.`,
    },
    {
      heading: "Structuring a Real CLI App",
      content: `Put the logic in a \`main(argv=None)\` function that builds the parser, parses \`argv\` and returns an exit code. Then end the script with \`if __name__ == "__main__": sys.exit(main())\`. This makes the module importable without side effects and easy to test: \`main(["report", "--top", "3"])\`.

To install the tool as a real command (e.g. \`salestool report\`), add an entry point in pyproject.toml: \`[project.scripts] salestool = "salestool.cli:main"\`. For larger CLIs, third-party libraries **click** and **typer** offer decorators and type-hint based parsing, but argparse needs no dependency.`,
      syntax: `def main(argv=None):
    parser = build_parser()
    args = parser.parse_args(argv)
    ...
    return 0

if __name__ == "__main__":
    sys.exit(main())
`,
    },
  ],
  examples: [
    {
      title: "Inspecting the Interpreter with sys",
      scenario: "A support engineer writes a diagnostic script that prints interpreter details and checks the Python version.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import sys

print("argv:", sys.argv[1:])
print("Version OK:", sys.version_info >= (3, 10))
print("Major.minor:", f"{sys.version_info.major}.{sys.version_info.minor}")
print("Recursion limit:", sys.getrecursionlimit())
print("Size of small int:", sys.getsizeof(1), "bytes")
print("Size of empty list:", sys.getsizeof([]), "bytes")
print("Max int size word:", sys.maxsize == 2**63 - 1 or sys.maxsize == 2**31 - 1)
print("Standard streams:", sys.stdout.name, sys.stderr.name)
print("'' or script dir first in sys.path:", isinstance(sys.path[0], str))

def check_age(age):
    if age < 0:
        print("error: age cannot be negative", file=sys.stderr)
        return 1
    print("age ok")
    return 0

code = check_age(25)
print("exit code would be", code)
`,
      python: {
        files: {
          "main.py": `import sys

print("argv:", sys.argv[1:])
print("Version OK:", sys.version_info >= (3, 10))
print("Major.minor:", f"{sys.version_info.major}.{sys.version_info.minor}")
print("Recursion limit:", sys.getrecursionlimit())
print("Size of small int:", sys.getsizeof(1), "bytes")
print("Size of empty list:", sys.getsizeof([]), "bytes")
print("Max int size word:", sys.maxsize == 2**63 - 1 or sys.maxsize == 2**31 - 1)
print("Standard streams:", sys.stdout.name, sys.stderr.name)
print("'' or script dir first in sys.path:", isinstance(sys.path[0], str))

def check_age(age):
    if age < 0:
        print("error: age cannot be negative", file=sys.stderr)
        return 1
    print("age ok")
    return 0

code = check_age(25)
print("exit code would be", code)
`,
        },
      },
      result: `argv: []
Version OK: True
Major.minor: 3.12
Recursion limit: 1000
Size of small int: 28 bytes
Size of empty list: 56 bytes
Max int size word: True
Standard streams: <stdout> <stderr>
'' or script dir first in sys.path: True
age ok
exit code would be 0`,
      explanation: "sys exposes the interpreter: arguments, version tuple (comparable with tuples), recursion limit and object sizes. Errors go to stderr, and functions return an exit code that would be passed to sys.exit(). (Sizes shown are for 64-bit CPython.)",
    },
    {
      title: "A Pipe-friendly Filter Reading stdin",
      scenario: "An admin wants a script that reads log lines from a pipe (cat app.log | python main.py) and prints only ERROR lines with line numbers, writing a summary to stderr.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import sys

errors = 0
for lineno, line in enumerate(sys.stdin, start=1):
    line = line.rstrip("\\n")
    if "ERROR" in line:
        errors += 1
        print(f"{lineno:>3}: {line}")

print(f"[summary] {errors} error lines found", file=sys.stderr)
status = 1 if errors else 0
print("exit status:", status)
`,
      python: {
        files: {
          "main.py": `import sys

errors = 0
for lineno, line in enumerate(sys.stdin, start=1):
    line = line.rstrip("\\n")
    if "ERROR" in line:
        errors += 1
        print(f"{lineno:>3}: {line}")

print(f"[summary] {errors} error lines found", file=sys.stderr)
status = 1 if errors else 0
print("exit status:", status)
`,
        },
        stdin: `INFO server started
ERROR db connection failed
INFO request /home
ERROR timeout on /api/pay
WARN slow query
`,
      },
      result: `  2: ERROR db connection failed
  4: ERROR timeout on /api/pay
[summary] 2 error lines found
exit status: 1`,
      explanation: "Iterating sys.stdin reads input line by line, so the script works with pipes and huge files. Matching lines go to stdout and the summary to stderr (in a real terminal, redirecting stdout to a file would leave the summary on screen). A non-zero status signals errors to CI.",
    },
    {
      title: "Sales Report CLI with argparse",
      scenario: "A data team wants a command-line tool: `python report.py sales.csv --top 3 --region South North --format json -vv`.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import argparse
import json

def build_parser():
    p = argparse.ArgumentParser(prog="report", description="Show top sales")
    p.add_argument("file", help="input CSV file")
    p.add_argument("-n", "--top", type=int, default=5, help="number of rows (default: 5)")
    p.add_argument("--region", nargs="+", default=["All"], help="one or more regions")
    p.add_argument("--format", choices=["table", "json"], default="table")
    p.add_argument("-v", "--verbose", action="count", default=0)
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--version", action="version", version="%(prog)s 1.2.0")
    return p

parser = build_parser()
args = parser.parse_args(["sales.csv", "--top", "3", "--region", "South", "North", "--format", "json", "-vv"])
print(args)
print(args.file, args.top, args.region, args.format, args.verbose, args.dry_run)

defaults = parser.parse_args(["data.csv"])
print(defaults.top, defaults.region, defaults.format, defaults.verbose, defaults.dry_run)

result = {"file": args.file, "top": args.top, "regions": args.region}
print(json.dumps(result) if args.format == "json" else result)

try:
    parser.parse_args(["x.csv", "--format", "xml"])
except SystemExit as e:
    print("argparse exited with code", e.code)
`,
      python: {
        files: {
          "main.py": `import argparse
import json

def build_parser():
    p = argparse.ArgumentParser(prog="report", description="Show top sales")
    p.add_argument("file", help="input CSV file")
    p.add_argument("-n", "--top", type=int, default=5, help="number of rows (default: 5)")
    p.add_argument("--region", nargs="+", default=["All"], help="one or more regions")
    p.add_argument("--format", choices=["table", "json"], default="table")
    p.add_argument("-v", "--verbose", action="count", default=0)
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--version", action="version", version="%(prog)s 1.2.0")
    return p

parser = build_parser()
args = parser.parse_args(["sales.csv", "--top", "3", "--region", "South", "North", "--format", "json", "-vv"])
print(args)
print(args.file, args.top, args.region, args.format, args.verbose, args.dry_run)

defaults = parser.parse_args(["data.csv"])
print(defaults.top, defaults.region, defaults.format, defaults.verbose, defaults.dry_run)

result = {"file": args.file, "top": args.top, "regions": args.region}
print(json.dumps(result) if args.format == "json" else result)

try:
    parser.parse_args(["x.csv", "--format", "xml"])
except SystemExit as e:
    print("argparse exited with code", e.code)
`,
        },
      },
      result: `Namespace(file='sales.csv', top=3, region=['South', 'North'], format='json', verbose=2, dry_run=False)
sales.csv 3 ['South', 'North'] json 2 False
5 ['All'] table 0 False
{"file": "sales.csv", "top": 3, "regions": ["South", "North"]}
usage: report [-h] [-n TOP] [--region REGION [REGION ...]]
              [--format {table,json}] [-v] [--dry-run] [--version]
              file
report: error: argument --format: invalid choice: 'xml' (choose from 'table', 'json')
argparse exited with code 2`,
      explanation: "type=int converts '3' to 3. nargs='+' collects several regions into a list. action='count' turns -vv into 2. --dry-run becomes args.dry_run. An invalid choice makes argparse print an error to stderr and exit with code 2 (we catch SystemExit only for the demo).",
    },
    {
      title: "Viewing the Auto-generated Help",
      scenario: "Show the --help text that argparse builds automatically for a backup tool, including a mutually exclusive group.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import argparse

parser = argparse.ArgumentParser(prog="backup", description="Back up a folder.")
parser.add_argument("source", help="folder to back up")
parser.add_argument("-d", "--dest", default="backups", metavar="DIR", help="destination folder")
group = parser.add_mutually_exclusive_group()
group.add_argument("--zip", action="store_true", help="create a zip archive")
group.add_argument("--tar", action="store_true", help="create a tar archive")
parser.add_argument("--exclude", action="append", default=[], help="pattern to skip (repeatable)")

print(parser.format_help())
args = parser.parse_args(["docs", "--zip", "--exclude", "*.tmp", "--exclude", "*.log"])
print(args)
try:
    parser.parse_args(["docs", "--zip", "--tar"])
except SystemExit as e:
    print("conflict -> exit code", e.code)
`,
      python: {
        files: {
          "main.py": `import argparse

parser = argparse.ArgumentParser(prog="backup", description="Back up a folder.")
parser.add_argument("source", help="folder to back up")
parser.add_argument("-d", "--dest", default="backups", metavar="DIR", help="destination folder")
group = parser.add_mutually_exclusive_group()
group.add_argument("--zip", action="store_true", help="create a zip archive")
group.add_argument("--tar", action="store_true", help="create a tar archive")
parser.add_argument("--exclude", action="append", default=[], help="pattern to skip (repeatable)")

print(parser.format_help())
args = parser.parse_args(["docs", "--zip", "--exclude", "*.tmp", "--exclude", "*.log"])
print(args)
try:
    parser.parse_args(["docs", "--zip", "--tar"])
except SystemExit as e:
    print("conflict -> exit code", e.code)
`,
        },
      },
      result: `usage: backup [-h] [-d DIR] [--zip | --tar] [--exclude EXCLUDE] source

Back up a folder.

positional arguments:
  source              folder to back up

options:
  -h, --help          show this help message and exit
  -d DIR, --dest DIR  destination folder
  --zip               create a zip archive
  --tar               create a tar archive
  --exclude EXCLUDE   pattern to skip (repeatable)

Namespace(source='docs', dest='backups', zip=True, tar=False, exclude=['*.tmp', '*.log'])
usage: backup [-h] [-d DIR] [--zip | --tar] [--exclude EXCLUDE] source
backup: error: argument --tar: not allowed with argument --zip
conflict -> exit code 2`,
      explanation: "format_help() returns the same text that `--help` prints. metavar changes the placeholder name. action='append' collects repeated --exclude values. The mutually exclusive group rejects --zip together with --tar (exit code 2).",
    },
    {
      title: "Git-style Sub-commands with main()",
      scenario: "Build a tiny to-do CLI with sub-commands `add`, `list` and `done`, structured with main(argv) so it can be tested.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import argparse
import sys

TODOS = ["Buy milk", "Pay electricity bill"]

def cmd_add(args):
    TODOS.append(" ".join(args.text))
    print(f"Added task #{len(TODOS)}")

def cmd_list(args):
    for i, t in enumerate(TODOS, start=1):
        if args.filter is None or args.filter.lower() in t.lower():
            print(f"{i}. {t}")

def cmd_done(args):
    if not 1 <= args.number <= len(TODOS):
        print(f"error: no task #{args.number}", file=sys.stderr)
        return 1
    print("Completed:", TODOS.pop(args.number - 1))

def main(argv=None):
    parser = argparse.ArgumentParser(prog="todo")
    sub = parser.add_subparsers(dest="command", required=True)

    p_add = sub.add_parser("add", help="add a task")
    p_add.add_argument("text", nargs="+")
    p_add.set_defaults(func=cmd_add)

    p_list = sub.add_parser("list", help="show tasks")
    p_list.add_argument("--filter")
    p_list.set_defaults(func=cmd_list)

    p_done = sub.add_parser("done", help="complete a task")
    p_done.add_argument("number", type=int)
    p_done.set_defaults(func=cmd_done)

    args = parser.parse_args(argv)
    return args.func(args) or 0

for argv in (["add", "Book", "train", "tickets"], ["list"], ["done", "1"], ["list", "--filter", "bill"], ["done", "9"]):
    print("$ todo", " ".join(argv))
    code = main(argv)
    print("  -> exit", code)

if __name__ == "__main__":
    pass  # real script: sys.exit(main())
`,
      python: {
        files: {
          "main.py": `import argparse
import sys

TODOS = ["Buy milk", "Pay electricity bill"]

def cmd_add(args):
    TODOS.append(" ".join(args.text))
    print(f"Added task #{len(TODOS)}")

def cmd_list(args):
    for i, t in enumerate(TODOS, start=1):
        if args.filter is None or args.filter.lower() in t.lower():
            print(f"{i}. {t}")

def cmd_done(args):
    if not 1 <= args.number <= len(TODOS):
        print(f"error: no task #{args.number}", file=sys.stderr)
        return 1
    print("Completed:", TODOS.pop(args.number - 1))

def main(argv=None):
    parser = argparse.ArgumentParser(prog="todo")
    sub = parser.add_subparsers(dest="command", required=True)

    p_add = sub.add_parser("add", help="add a task")
    p_add.add_argument("text", nargs="+")
    p_add.set_defaults(func=cmd_add)

    p_list = sub.add_parser("list", help="show tasks")
    p_list.add_argument("--filter")
    p_list.set_defaults(func=cmd_list)

    p_done = sub.add_parser("done", help="complete a task")
    p_done.add_argument("number", type=int)
    p_done.set_defaults(func=cmd_done)

    args = parser.parse_args(argv)
    return args.func(args) or 0

for argv in (["add", "Book", "train", "tickets"], ["list"], ["done", "1"], ["list", "--filter", "bill"], ["done", "9"]):
    print("$ todo", " ".join(argv))
    code = main(argv)
    print("  -> exit", code)

if __name__ == "__main__":
    pass  # real script: sys.exit(main())
`,
        },
      },
      result: `$ todo add Book train tickets
Added task #3
  -> exit 0
$ todo list
1. Buy milk
2. Pay electricity bill
3. Book train tickets
  -> exit 0
$ todo done 1
Completed: Buy milk
  -> exit 0
$ todo list --filter bill
1. Pay electricity bill
  -> exit 0
$ todo done 9
error: no task #9
  -> exit 1`,
      explanation: "Each sub-parser has its own arguments and uses set_defaults(func=...) to attach a handler. main(argv) returns an exit code, so we can call it with test argument lists; a real script would call sys.exit(main()) under the __main__ guard.",
    },
  ],
  interview: [
    {
      q: "What is sys.argv?",
      a: "A list of strings with the command-line arguments passed to the script. `sys.argv[0]` is the script name (or '-c'/'' in some modes) and the rest are the arguments as strings - you must convert types yourself.",
      level: "Easy",
    },
    {
      q: "What is the difference between sys.exit() and exit()/quit()?",
      a: "sys.exit() raises SystemExit and is the proper way to exit programs with a status code. exit() and quit() are helpers added by the site module for the interactive shell and may not exist (e.g. with python -S or frozen apps), so they should not be used in scripts.",
      level: "Medium",
    },
    {
      q: "What do exit codes 0, 1 and 2 usually mean?",
      a: "0 means success. Non-zero means failure: 1 is a general error, 2 conventionally means incorrect command-line usage (argparse exits with 2 on invalid arguments). Shells and CI systems use the exit code to decide whether a step passed.",
      level: "Easy",
    },
    {
      q: "Why write error messages to stderr instead of stdout?",
      a: "So that normal output can be redirected or piped (`> out.txt`, `| grep`) without mixing in error text, while errors are still visible to the user or captured separately (`2> err.log`).",
      level: "Medium",
    },
    {
      q: "Positional vs optional arguments in argparse?",
      a: "Positional arguments have no dashes, are required by default and are identified by order. Optional arguments start with - or --, can appear in any order, are optional unless required=True, and often have defaults.",
      level: "Easy",
    },
    {
      q: "How do you create a boolean flag in argparse?",
      a: "`parser.add_argument('--verbose', action='store_true')`. If the flag is present, args.verbose is True, otherwise False. Avoid `type=bool`, because bool('False') is True.",
      level: "Medium",
    },
    {
      q: "What does nargs='+' vs nargs='*' vs nargs='?' mean?",
      a: "'+' requires one or more values and gives a list. '*' accepts zero or more (a list, possibly empty). '?' accepts zero or one value; if missing it uses default (or const if the option is given without a value).",
      level: "Medium",
    },
    {
      q: "How do you implement sub-commands like git commit?",
      a: "Use `subparsers = parser.add_subparsers(dest='command', required=True)`, then `subparsers.add_parser('commit')` for each command with its own arguments. Attach a handler with `set_defaults(func=handler)` and call `args.func(args)`.",
      level: "Medium",
    },
    {
      q: "Why use `if __name__ == '__main__':` in a CLI script?",
      a: "Code under the guard runs only when the file is executed directly, not when imported. This lets you import functions for tests or reuse, and the `main()` function can be called with a custom argv list in tests.",
      level: "Easy",
    },
    {
      q: "How do you test an argparse-based CLI?",
      a: "Make `main(argv=None)` pass argv to `parser.parse_args(argv)`, then call `main(['--top', '3'])` in tests and check the return code/output (pytest's capsys captures stdout/stderr). For invalid input, assert that SystemExit is raised with code 2.",
      level: "Hard",
    },
    {
      q: "How do you make a Python CLI installable as a command?",
      a: "Define a console script entry point in pyproject.toml: `[project.scripts] mytool = \"mypkg.cli:main\"`. After `pip install .`, pip generates a `mytool` executable that calls `main()`. `python -m mypkg` works if the package has a `__main__.py`.",
      level: "Hard",
    },
    {
      q: "argparse vs click vs typer?",
      a: "argparse is in the standard library - no dependency, good for small/medium tools. click (third-party) uses decorators, composable commands, colours and prompts. typer builds on click and derives the CLI from type hints. Choose argparse for zero dependencies, click/typer for large polished CLIs.",
      level: "Medium",
    },
  ],
  practice: [
    {
      task: "Write a script that reads numbers from stdin (one per line), ignores blank or invalid lines (print a warning to stderr), and prints the count, sum and average.",
      hint: "Loop over sys.stdin, strip, try float(), except ValueError.",
      solution: `import sys

nums = []
for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    try:
        nums.append(float(line))
    except ValueError:
        print(f"warning: skipping {line!r}", file=sys.stderr)

if nums:
    print("count:", len(nums), "sum:", sum(nums), "avg:", sum(nums) / len(nums))
else:
    print("no numbers")
`,
    },
    {
      task: "Build an argparse calculator: `calc 10 5 --op mul`. Positional a and b (float), --op with choices add/sub/mul/div (default add). Parse a test list and print the result; handle division by zero with an error message and exit code 1.",
      hint: "Use a dict of operations: {'add': lambda a, b: a + b, ...}.",
      solution: `import argparse
import sys

OPS = {"add": lambda a, b: a + b, "sub": lambda a, b: a - b,
       "mul": lambda a, b: a * b, "div": lambda a, b: a / b}

def main(argv=None):
    p = argparse.ArgumentParser(prog="calc")
    p.add_argument("a", type=float)
    p.add_argument("b", type=float)
    p.add_argument("--op", choices=OPS, default="add")
    args = p.parse_args(argv)
    try:
        print(OPS[args.op](args.a, args.b))
        return 0
    except ZeroDivisionError:
        print("error: division by zero", file=sys.stderr)
        return 1

print("exit", main(["10", "5", "--op", "mul"]))
print("exit", main(["7", "0", "--op", "div"]))
`,
    },
    {
      task: "Create a parser for a `greet` tool with: positional name, `--times` (int, default 1), `--shout` flag (upper-case) and `--lang` choice of en/hi (default en: 'Hello', hi: 'Namaste'). Print the greeting for argv ['Asha', '--times', '2', '--lang', 'hi', '--shout'].",
      hint: "action='store_true' for --shout.",
      solution: `import argparse

p = argparse.ArgumentParser(prog="greet")
p.add_argument("name")
p.add_argument("--times", type=int, default=1)
p.add_argument("--shout", action="store_true")
p.add_argument("--lang", choices=["en", "hi"], default="en")
args = p.parse_args(["Asha", "--times", "2", "--lang", "hi", "--shout"])

word = {"en": "Hello", "hi": "Namaste"}[args.lang]
msg = f"{word}, {args.name}!"
for _ in range(args.times):
    print(msg.upper() if args.shout else msg)
`,
    },
    {
      task: "Write a custom argparse type function `positive_int` that raises argparse.ArgumentTypeError for values <= 0, use it for `--workers`, and show what happens with '--workers 4' and '--workers -2'.",
      hint: "def positive_int(text): n = int(text); if n <= 0: raise argparse.ArgumentTypeError(...)",
      solution: `import argparse

def positive_int(text):
    n = int(text)
    if n <= 0:
        raise argparse.ArgumentTypeError(f"{text} is not a positive integer")
    return n

p = argparse.ArgumentParser(prog="worker")
p.add_argument("--workers", type=positive_int, default=1)
print(p.parse_args(["--workers", "4"]).workers)
try:
    p.parse_args(["--workers", "-2"])
except SystemExit as e:
    print("exit code:", e.code)
`,
    },
  ],
  quiz: [
    {
      question: "For `python app.py run --fast`, what is sys.argv[1]?",
      options: [
        "'app.py'",
        "'run'",
        "'--fast'",
        "'python'",
      ],
      answer: 1,
      explanation: "argv[0] is the script name, argv[1] is the first argument.",
    },
    {
      question: "What exit code does argparse use for invalid arguments?",
      options: [
        "0",
        "1",
        "2",
        "-1",
      ],
      answer: 2,
      explanation: "argparse prints usage and an error to stderr and exits with status 2.",
    },
    {
      question: "The option `--dry-run` is accessed as...",
      options: [
        "args.dry-run",
        "args['dry-run']",
        "args.dry_run",
        "args.dryrun",
      ],
      answer: 2,
      explanation: "Dashes are converted to underscores in the attribute name.",
    },
    {
      question: "Which action makes `-vvv` produce 3?",
      options: [
        "store_true",
        "append",
        "count",
        "store_const",
      ],
      answer: 2,
      explanation: "action='count' counts how many times the option appears.",
    },
    {
      question: "Where should error messages from a CLI go?",
      options: [
        "stdout",
        "stderr",
        "stdin",
        "a log file only",
      ],
      answer: 1,
      explanation: "stderr keeps errors separate from normal output for pipes and redirection.",
    },
    {
      question: "What does sys.exit('Config missing') do?",
      options: [
        "Exits with code 0 silently",
        "Prints the message to stderr and exits with code 1",
        "Raises ValueError",
        "Prints to stdout and continues",
      ],
      answer: 1,
      explanation: "A non-integer argument is printed to stderr and the exit status is 1.",
    },
  ],
};
