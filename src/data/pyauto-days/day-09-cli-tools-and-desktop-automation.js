export default {
  id: "day-09-cli-tools-and-desktop-automation",
  title: "CLI Tools and Desktop Automation: argparse, click and pyautogui",
  module: "Module 3: Bots & Scheduling",
  day: 9,
  level: "Advanced",
  duration: "3 hours",
  summary: "Turn your automation scripts into proper command-line tools with argparse and click (arguments, options, flags, sub-commands, help text, exit codes), and automate desktop applications that have no API with pyautogui: mouse, keyboard, hotkeys, screenshots, and the fail-safe that keeps you in control.",
  objectives: [
    "Build command-line tools with positional arguments, options, flags and validation using argparse",
    "Create sub-commands (like git add / git commit) and use exit codes correctly",
    "Write the same tool with click decorators and test it with CliRunner",
    "Control mouse and keyboard with pyautogui, including hotkeys and typing",
    "Use the pyautogui fail-safe, pauses and image recognition responsibly",
  ],
  theory: [
    {
      heading: "Why Build CLI Tools?",
      content: "A script with hardcoded values (`folder = \"C:/Users/Asha/Downloads\"`) works only for you. A **command-line interface (CLI)** lets anyone run it with their own inputs: `python organize.py ~/Downloads --dry-run`. Schedulers (cron, Task Scheduler) also pass arguments this way, so the same script can serve many jobs. A good CLI has clear help (`--help`), sensible defaults, input validation and correct exit codes (0 = success, non-zero = failure).",
      points: [
        "Positional argument: required value identified by position (python tool.py report.xlsx)",
        "Option: named value (--month 11, -m 11)",
        "Flag: on/off switch (--dry-run, -v)",
        "Sub-command: tool with several actions (tool.py send, tool.py preview)",
      ],
    },
    {
      heading: "argparse: The Standard Library Way",
      content: "`argparse.ArgumentParser` defines what your program accepts and auto-generates `--help`. `add_argument()` supports `type` (convert and validate), `default`, `choices`, `required`, `action=\"store_true\"` for flags, `action=\"count\"` for -vvv verbosity, and `nargs` for multiple values. `parse_args()` reads `sys.argv`; you can also pass a list for testing: `parser.parse_args([\"data.csv\", \"--top\", \"3\"])`.",
      syntax: `import argparse
from pathlib import Path

parser = argparse.ArgumentParser(prog="report", description="Create a sales report")
parser.add_argument("input", type=Path, help="CSV file with sales data")
parser.add_argument("-o", "--output", default="report.xlsx", help="output file (default: %(default)s)")
parser.add_argument("--month", type=int, choices=range(1, 13), metavar="1-12")
parser.add_argument("--dry-run", action="store_true", help="show what would happen")
parser.add_argument("-v", "--verbose", action="count", default=0)
args = parser.parse_args()
print(args.input, args.output, args.month, args.dry_run, args.verbose)
`,
      tip: "Dashes in option names become underscores in attributes: --dry-run is args.dry_run.",
    },
    {
      heading: "Sub-commands and Exit Codes",
      content: "Use `parser.add_subparsers(dest=\"command\", required=True)` to create commands, each with its own arguments. `set_defaults(func=...)` maps a command to the function that handles it. End the program with `sys.exit(code)`: 0 for success, 1 for general errors, 2 for usage errors (argparse uses 2 automatically when arguments are invalid). `parser.error(\"message\")` prints usage plus the message and exits with code 2.",
      syntax: `sub = parser.add_subparsers(dest="command", required=True)
p_send = sub.add_parser("send", help="email the report")
p_send.add_argument("--to", required=True)
p_send.set_defaults(func=send_report)

args = parser.parse_args()
sys.exit(args.func(args))       # handler returns 0 or 1
`,
    },
    {
      heading: "click: Decorator-Based CLIs",
      content: "`click` (pip install click) is a popular third-party library (used by Flask) that defines CLIs with decorators. It offers prompts, password input, colored output (`click.secho`), progress bars, file and path types with existence checks, and a `CliRunner` for testing. Typer, built on click, uses type hints instead of decorators.",
      syntax: `import click

@click.command()
@click.argument("folder", type=click.Path(exists=True, file_okay=False))
@click.option("--ext", default=".pdf", show_default=True, help="extension to count")
@click.option("--dry-run", is_flag=True)
def count(folder, ext, dry_run):
    """Count files with EXT in FOLDER."""
    click.echo(f"Counting {ext} in {folder}")

if __name__ == "__main__":
    count()
`,
      points: [
        "Groups: @click.group() then @cli.command() for sub-commands",
        "click.prompt(), click.confirm(\"Delete 200 files?\", abort=True), click.password_option()",
        "with click.progressbar(items) as bar: for x in bar: ...",
      ],
    },
    {
      heading: "Desktop Automation with pyautogui",
      content: "Some tasks happen in desktop apps with no API: an old billing system, a government utility, a legacy ERP screen. `pyautogui` (pip install pyautogui) moves the mouse, clicks, types and presses hotkeys exactly like a human. Coordinates start at (0, 0) at the **top-left** of the primary screen. It works on Windows, macOS (grant Accessibility permission) and Linux X11 (Wayland support is limited).",
      syntax: `import pyautogui as pag

print(pag.size())                    # screen resolution, e.g. Size(width=1920, height=1080)
print(pag.position())                # current mouse position
pag.moveTo(500, 300, duration=0.5)
pag.click()                          # or pag.click(500, 300), pag.doubleClick(), pag.rightClick()
pag.write("Hello from Python", interval=0.05)
pag.press("enter")
pag.hotkey("ctrl", "s")              # keyboard shortcut (use "command" on macOS)
pag.screenshot("screen.png")
`,
      tip: "Prefer real integrations first: APIs, files, openpyxl, Selenium. Use screen automation as the last option because it breaks when the window moves, the resolution changes or a popup appears.",
    },
    {
      heading: "Safety: Fail-safe, Pauses and Image Matching",
      content: "A runaway mouse script can click the wrong buttons fast. pyautogui has a **fail-safe**: move the mouse quickly to any screen corner and `pyautogui.FailSafeException` stops the script. Keep `pyautogui.FAILSAFE = True` (the default). `pyautogui.PAUSE = 0.5` adds a pause after every call, giving apps time to react and you time to intervene. Use `locateOnScreen(\"button.png\", confidence=0.9)` (needs opencv-python for confidence) to find buttons by image instead of hardcoded coordinates.",
      points: [
        "Test with a countdown (time.sleep(5)) so you can switch to the right window",
        "Never automate other people's computers or accounts without permission",
        "Do not use desktop automation to cheat in games, exams or online tests, or to bypass security prompts",
        "Log each step and take screenshots on error for debugging",
      ],
    },
  ],
  examples: [
    {
      title: "argparse Basics: Arguments, Options and Flags",
      scenario: "Build a CLI for a report tool and test it by passing argument lists directly to parse_args(), so it runs without a terminal.",
      steps: [
        "No pip install needed (argparse is built in)",
        "Run: python main.py",
        "Real usage from a terminal: python main.py sales.csv --top 3 --dry-run -vv",
      ],
      code: `import argparse

parser = argparse.ArgumentParser(prog="report", description="Create a sales report from a CSV file")
parser.add_argument("input", help="CSV file with sales data")
parser.add_argument("-o", "--output", default="report.xlsx", help="output file (default: %(default)s)")
parser.add_argument("--top", type=int, default=5, help="number of top products")
parser.add_argument("--region", choices=["north", "south", "east", "west"])
parser.add_argument("--dry-run", action="store_true", help="do not write files")
parser.add_argument("-v", "--verbose", action="count", default=0)

tests = [
    ["sales.csv"],
    ["sales.csv", "--top", "3", "--region", "west", "--dry-run", "-vv"],
    ["march.csv", "-o", "march.xlsx"],
]
for argv in tests:
    args = parser.parse_args(argv)
    print(vars(args))

print(parser.format_usage().strip())
`,
      result: `{'input': 'sales.csv', 'output': 'report.xlsx', 'top': 5, 'region': None, 'dry_run': False, 'verbose': 0}
{'input': 'sales.csv', 'output': 'report.xlsx', 'top': 3, 'region': 'west', 'dry_run': True, 'verbose': 2}
{'input': 'march.csv', 'output': 'march.xlsx', 'top': 5, 'region': None, 'dry_run': False, 'verbose': 0}
usage: report [-h] [-o OUTPUT] [--top TOP] [--region {north,south,east,west}]
              [--dry-run] [-v]
              input`,
      explanation: "parse_args(list) is perfect for testing: without a list it reads sys.argv. type=int converts '3' to 3 automatically, choices restricts allowed values, store_true makes a flag, and action='count' turns -vv into 2. vars(args) converts the Namespace into a dict. format_usage() shows the auto-generated usage line that --help also prints.",
      python: {
        files: {
          "main.py": `import argparse

parser = argparse.ArgumentParser(prog="report", description="Create a sales report from a CSV file")
parser.add_argument("input", help="CSV file with sales data")
parser.add_argument("-o", "--output", default="report.xlsx", help="output file (default: %(default)s)")
parser.add_argument("--top", type=int, default=5, help="number of top products")
parser.add_argument("--region", choices=["north", "south", "east", "west"])
parser.add_argument("--dry-run", action="store_true", help="do not write files")
parser.add_argument("-v", "--verbose", action="count", default=0)

tests = [
    ["sales.csv"],
    ["sales.csv", "--top", "3", "--region", "west", "--dry-run", "-vv"],
    ["march.csv", "-o", "march.xlsx"],
]
for argv in tests:
    args = parser.parse_args(argv)
    print(vars(args))

print(parser.format_usage().strip())
`,
        },
      },
    },
    {
      title: "A File Tool with Sub-commands, Validation and Exit Codes",
      scenario: "Build 'filetool' with two commands: 'count' (count files by extension in a folder) and 'clean' (delete .tmp files, with --dry-run). Invalid input must produce exit code 2.",
      steps: [
        "No pip install needed",
        "Run: python main.py (it creates a sample folder and simulates several command lines)",
        "Real usage: python main.py count work   |   python main.py clean work --dry-run",
      ],
      code: `import argparse
import sys
from collections import Counter
from pathlib import Path

def existing_dir(value):
    p = Path(value)
    if not p.is_dir():
        raise argparse.ArgumentTypeError(f"'{value}' is not a folder")
    return p

def cmd_count(args):
    counts = Counter(p.suffix.lower() or "(none)" for p in args.folder.iterdir() if p.is_file())
    for ext, n in sorted(counts.items()):
        print(f"  {ext:<6} {n}")
    return 0

def cmd_clean(args):
    tmp = sorted(args.folder.glob("*.tmp"))
    for p in tmp:
        print(("  would delete " if args.dry_run else "  deleted ") + p.name)
        if not args.dry_run:
            p.unlink()
    return 0

def build_parser():
    parser = argparse.ArgumentParser(prog="filetool")
    sub = parser.add_subparsers(dest="command", required=True)
    c = sub.add_parser("count", help="count files by extension")
    c.add_argument("folder", type=existing_dir)
    c.set_defaults(func=cmd_count)
    k = sub.add_parser("clean", help="delete .tmp files")
    k.add_argument("folder", type=existing_dir)
    k.add_argument("--dry-run", action="store_true")
    k.set_defaults(func=cmd_clean)
    return parser

def main(argv):
    args = build_parser().parse_args(argv)
    return args.func(args)

work = Path("work")
work.mkdir(exist_ok=True)
for name in ["a.pdf", "b.PDF", "c.tmp", "d.tmp", "notes.txt"]:
    (work / name).write_text("x")

for argv in (["count", "work"], ["clean", "work", "--dry-run"], ["clean", "work"], ["count", "missing"]):
    print("$ filetool", " ".join(argv))
    try:
        code = main(argv)
    except SystemExit as e:
        code = e.code
    print("  exit code:", code)
`,
      result: `$ filetool count work
  .pdf   2
  .tmp   2
  .txt   1
  exit code: 0
$ filetool clean work --dry-run
  would delete c.tmp
  would delete d.tmp
  exit code: 0
$ filetool clean work
  deleted c.tmp
  deleted d.tmp
  exit code: 0
$ filetool count missing
usage: filetool count [-h] folder
filetool count: error: argument folder: 'missing' is not a folder
  exit code: 2`,
      explanation: "A custom type function (existing_dir) validates input; raising ArgumentTypeError makes argparse print a clean error to stderr and exit with code 2. Each sub-parser registers its handler with set_defaults(func=...), so main() simply calls args.func(args). In a real script you would end with sys.exit(main(sys.argv[1:])); here we catch SystemExit only to demonstrate the exit codes.",
      python: {
        files: {
          "main.py": `import argparse
import sys
from collections import Counter
from pathlib import Path

def existing_dir(value):
    p = Path(value)
    if not p.is_dir():
        raise argparse.ArgumentTypeError(f"'{value}' is not a folder")
    return p

def cmd_count(args):
    counts = Counter(p.suffix.lower() or "(none)" for p in args.folder.iterdir() if p.is_file())
    for ext, n in sorted(counts.items()):
        print(f"  {ext:<6} {n}")
    return 0

def cmd_clean(args):
    tmp = sorted(args.folder.glob("*.tmp"))
    for p in tmp:
        print(("  would delete " if args.dry_run else "  deleted ") + p.name)
        if not args.dry_run:
            p.unlink()
    return 0

def build_parser():
    parser = argparse.ArgumentParser(prog="filetool")
    sub = parser.add_subparsers(dest="command", required=True)
    c = sub.add_parser("count", help="count files by extension")
    c.add_argument("folder", type=existing_dir)
    c.set_defaults(func=cmd_count)
    k = sub.add_parser("clean", help="delete .tmp files")
    k.add_argument("folder", type=existing_dir)
    k.add_argument("--dry-run", action="store_true")
    k.set_defaults(func=cmd_clean)
    return parser

def main(argv):
    args = build_parser().parse_args(argv)
    return args.func(args)

work = Path("work")
work.mkdir(exist_ok=True)
for name in ["a.pdf", "b.PDF", "c.tmp", "d.tmp", "notes.txt"]:
    (work / name).write_text("x")

for argv in (["count", "work"], ["clean", "work", "--dry-run"], ["clean", "work"], ["count", "missing"]):
    print("$ filetool", " ".join(argv))
    try:
        code = main(argv)
    except SystemExit as e:
        code = e.code
    print("  exit code:", code)
`,
        },
      },
    },
    {
      title: "The Same Idea with click (and Testing with CliRunner)",
      scenario: "Build a 'greet-report' click group with two commands and test it in code with CliRunner, the way professional teams test CLIs.",
      steps: [
        "Install: pip install click",
        "Run: python main.py",
        "Real usage: python main.py summary --month 11 --dry-run  |  python main.py summary --help",
      ],
      code: `import click
from click.testing import CliRunner

@click.group()
def cli():
    """Sales report tool."""

@cli.command()
@click.option("--month", type=click.IntRange(1, 12), required=True, help="month number")
@click.option("--dry-run", is_flag=True, help="do not send anything")
def summary(month, dry_run):
    """Build the monthly summary."""
    click.echo(f"Building summary for month {month}")
    if dry_run:
        click.echo("Dry run: nothing sent")

@cli.command()
@click.argument("email")
@click.confirmation_option(prompt="Really send the report?")
def send(email):
    """Send the report to EMAIL."""
    click.echo(f"Report sent to {email}")

runner = CliRunner()
for args in (["summary", "--month", "11", "--dry-run"],
             ["summary", "--month", "13"],
             ["send", "boss@example.com", "--yes"]):
    result = runner.invoke(cli, args)
    print("$", " ".join(args), "-> exit", result.exit_code)
    print(result.output.strip().splitlines()[-1])
`,
      result: `$ summary --month 11 --dry-run -> exit 0
Dry run: nothing sent
$ summary --month 13 -> exit 2
Error: Invalid value for '--month': 13 is not in the range 1<=x<=12.
$ send boss@example.com --yes -> exit 0
Report sent to boss@example.com`,
      explanation: "@click.group() creates a parent command; @cli.command() adds sub-commands. IntRange validates the month and click exits with code 2 and a friendly error for 13. confirmation_option adds a --yes flag and otherwise asks 'Really send the report?' before a risky action. CliRunner.invoke runs the command in-process and captures output and exit code, so CLIs can be unit-tested without a terminal.",
    },
    {
      title: "Desktop Automation: Fill Notepad Safely with pyautogui",
      scenario: "Practise mouse and keyboard automation with a harmless target: open Notepad (Windows), type a daily log entry and save it with a keyboard shortcut. The fail-safe and pauses are enabled.",
      steps: [
        "Install: pip install pyautogui",
        "Close unsaved work in other apps. Keep your hand on the mouse: moving it to a screen corner aborts the script",
        "Run: python main.py (Windows; on macOS replace Notepad with TextEdit and 'ctrl' with 'command')",
      ],
      code: `import time
from datetime import date
import pyautogui as pag

pag.FAILSAFE = True          # move mouse to a corner to abort
pag.PAUSE = 0.4              # pause after every pyautogui call

print("Screen size:", pag.size())
print("Starting in 3 seconds... move the mouse to a corner to cancel")
time.sleep(3)

try:
    pag.press("win")
    pag.write("notepad", interval=0.05)
    pag.press("enter")
    time.sleep(2)                                   # give Notepad time to open

    pag.write(f"Daily log - {date.today():%d %b %Y}\\n", interval=0.03)
    pag.write("- Sales report generated\\n- Email sent to manager\\n", interval=0.03)

    pag.hotkey("ctrl", "s")
    time.sleep(1.5)
    pag.write(f"daily_log_{date.today():%Y%m%d}.txt", interval=0.03)
    pag.press("enter")
    pag.screenshot("after_save.png")
    print("Done. Screenshot saved as after_save.png")
except pag.FailSafeException:
    print("Aborted by user (mouse moved to a corner)")
`,
      result: `Screen size: Size(width=1920, height=1080)
Starting in 3 seconds... move the mouse to a corner to cancel
Done. Screenshot saved as after_save.png
(Notepad opens, the text is typed and the file is saved in the default folder)`,
      explanation: "press('win') opens the Start menu and write() types characters one by one with a small interval, like a person. sleep() gives slower apps time to appear (better: wait for a window or image). hotkey('ctrl', 's') presses the keys together. FAILSAFE raises FailSafeException when the mouse hits a corner, which we catch to stop cleanly. PAUSE slows every action so you can follow what happens.",
    },
    {
      title: "Find a Button by Image Instead of Coordinates",
      scenario: "A legacy billing app has an 'Export' button whose position changes with window size. Locate it by a saved screenshot of the button and click it, with a timeout.",
      steps: [
        "Install: pip install pyautogui opencv-python (OpenCV enables the confidence parameter)",
        "Take a small screenshot of only the Export button and save it as export_button.png",
        "Open the app, then run: python main.py",
      ],
      code: `import time
import pyautogui as pag

pag.FAILSAFE = True

def wait_for_image(path, timeout=15, confidence=0.9):
    end = time.monotonic() + timeout
    while time.monotonic() < end:
        try:
            box = pag.locateOnScreen(path, confidence=confidence)
            if box:
                return box
        except pag.ImageNotFoundException:
            pass
        time.sleep(0.5)
    raise TimeoutError(f"{path} not visible after {timeout}s")

try:
    box = wait_for_image("export_button.png")
    x, y = pag.center(box)
    print("Found Export button at", (x, y))
    pag.click(x, y)
except TimeoutError as e:
    pag.screenshot("not_found.png")
    print("Error:", e, "- screenshot saved for debugging")
`,
      result: `Found Export button at (1184, 642)
(coordinates depend on your screen and window position)`,
      explanation: "locateOnScreen() searches the screen for the image; confidence=0.9 allows small rendering differences (requires OpenCV). Recent pyautogui versions raise ImageNotFoundException when nothing is found, older ones return None, so the helper handles both. center() gives the middle point of the match box for clicking. A timeout plus a debug screenshot make the bot fail clearly instead of clicking blindly.",
    },
  ],
  interview: [
    { q: "What is the difference between a positional argument and an option in argparse?", a: "Positional arguments are required by default and identified by their position (`input`). Options start with - or -- (`--output`), are optional by default, can have defaults, and can appear in any order.", level: "Easy" },
    { q: "How do you create a boolean flag in argparse?", a: "`parser.add_argument(\"--dry-run\", action=\"store_true\")`. It is False by default and True when present. Use store_false for the opposite, or argparse.BooleanOptionalAction for --flag/--no-flag pairs.", level: "Easy" },
    { q: "What exit codes should a CLI use?", a: "0 for success, non-zero for failure: 1 for general errors, 2 for command-line usage errors (argparse and click use 2). Schedulers and shell scripts (&&, CI pipelines) rely on these codes to detect failure.", level: "Medium" },
    { q: "How do you test an argparse-based script without running it from the terminal?", a: "Structure code as main(argv) and call parser.parse_args(argv) with a list in tests. Catch SystemExit to check error exit codes, and use capsys (pytest) or redirect_stdout to check output.", level: "Medium" },
    { q: "argparse vs click vs Typer?", a: "argparse is in the standard library (no dependency) and fully capable but verbose. click uses decorators, has nested groups, prompts, colors, progress bars, path validation and CliRunner for testing. Typer builds on click using type hints for even less code. For internal tools without dependencies choose argparse; for bigger CLIs click/Typer.", level: "Medium" },
    { q: "How do you implement sub-commands in argparse?", a: "Call `parser.add_subparsers(dest=\"command\", required=True)`, create each command with `sub.add_parser(\"name\")`, add its own arguments, and use `set_defaults(func=handler)` to dispatch: `args.func(args)`.", level: "Medium" },
    { q: "What is the pyautogui fail-safe?", a: "With pyautogui.FAILSAFE = True (default), moving the mouse to any corner of the screen raises FailSafeException, stopping the script. It is the emergency brake for runaway automation and should never be disabled.", level: "Easy" },
    { q: "Why is GUI (screen) automation considered fragile?", a: "It depends on screen resolution, scaling, window position, themes, language, timing and unexpected popups. Prefer APIs, file-level automation, COM/UI Automation libraries (pywinauto) or Selenium for browsers; use pyautogui as a last resort with image matching, waits and logging.", level: "Medium" },
    { q: "How can you make pyautogui scripts more reliable?", a: "Use image recognition (locateOnScreen with confidence) instead of fixed coordinates, wait for UI elements with timeouts, set PAUSE, maximise windows to a known size, use keyboard shortcuts instead of mouse clicks where possible, take screenshots on errors, and run on a dedicated machine with fixed resolution.", level: "Hard" },
    { q: "What are the ethical limits of desktop automation?", a: "Automate only systems and accounts you are authorised to use, respect software licences and terms, do not bypass security dialogs or CAPTCHAs, do not cheat in games, exams or online tests, and do not handle others' personal data without permission.", level: "Medium" },
    { q: "How do you make a Python CLI installable as a command like `salesbot`?", a: "Package it with a pyproject.toml and define `[project.scripts] salesbot = \"salesbot.cli:main\"`. After `pip install .` (or pipx install), the salesbot command is available on PATH.", level: "Hard" },
    { q: "How do you ask for a password in a CLI without showing it on screen?", a: "Use `getpass.getpass(\"Password: \")` from the standard library, or click's `@click.password_option()` / `click.prompt(..., hide_input=True)`. Better still, read secrets from environment variables for unattended runs.", level: "Medium" },
  ],
  practice: [
    {
      task: "Write an argparse CLI 'rename.py' that takes a folder, --prefix (required) and --dry-run, and prints 'old -> new' for every file.",
      hint: "Use type=Path for the folder, required=True for --prefix and action='store_true' for --dry-run.",
      solution: `import argparse
from pathlib import Path

parser = argparse.ArgumentParser(description="Add a prefix to every file")
parser.add_argument("folder", type=Path)
parser.add_argument("--prefix", required=True)
parser.add_argument("--dry-run", action="store_true")
args = parser.parse_args()

for p in sorted(args.folder.iterdir()):
    if p.is_file() and not p.name.startswith(args.prefix):
        new = p.with_name(args.prefix + p.name)
        print(p.name, "->", new.name)
        if not args.dry_run:
            p.rename(new)
`,
    },
    {
      task: "Add a custom type function positive_int to argparse so that --days 0 or --days -3 gives a clean error.",
      hint: "Raise argparse.ArgumentTypeError inside the function.",
      solution: `import argparse

def positive_int(value):
    n = int(value)
    if n <= 0:
        raise argparse.ArgumentTypeError("must be a positive integer")
    return n

parser = argparse.ArgumentParser()
parser.add_argument("--days", type=positive_int, default=7)
print(parser.parse_args(["--days", "30"]).days)   # 30
`,
    },
    {
      task: "Write a click command 'backup' with an argument SOURCE (must exist), an option --dest (default 'backup') and a confirmation prompt, which copies the folder using shutil.copytree.",
      hint: "click.Path(exists=True), click.confirm(..., abort=True).",
      solution: `import shutil
import click

@click.command()
@click.argument("source", type=click.Path(exists=True, file_okay=False))
@click.option("--dest", default="backup", show_default=True)
def backup(source, dest):
    """Copy SOURCE folder to DEST."""
    click.confirm(f"Copy {source} to {dest}?", abort=True)
    shutil.copytree(source, dest, dirs_exist_ok=True)
    click.secho("Backup complete", fg="green")

if __name__ == "__main__":
    backup()
`,
    },
    {
      task: "Write a pyautogui script that prints the mouse position every second for 10 seconds (useful to find coordinates), and stops early if the fail-safe triggers.",
      hint: "Loop 10 times with pag.position() and time.sleep(1); catch FailSafeException.",
      solution: `import time
import pyautogui as pag

try:
    for _ in range(10):
        x, y = pag.position()
        print(f"x={x:4d} y={y:4d}")
        pag.failSafeCheck()     # raises if the mouse is in a corner
        time.sleep(1)
except pag.FailSafeException:
    print("Stopped by fail-safe")
`,
    },
  ],
  quiz: [
    { question: "How do you access the value of --dry-run after parse_args()?", options: ["args['dry-run']", "args.dry-run", "args.dry_run", "args.get('dry_run')"], answer: 2, explanation: "argparse converts dashes to underscores for attribute names." },
    { question: "Which action makes an argparse option count repetitions like -vvv?", options: ["store_true", "count", "append", "store_const"], answer: 1, explanation: "action='count' increments the value for each occurrence." },
    { question: "What exit code does argparse use when arguments are invalid?", options: ["0", "1", "2", "-1"], answer: 2, explanation: "argparse calls parser.error(), which exits with status 2." },
    { question: "In click, which decorator creates a parent command with sub-commands?", options: ["@click.command()", "@click.group()", "@click.option()", "@click.parent()"], answer: 1, explanation: "@click.group() creates a group; commands are attached with @group.command()." },
    { question: "How do you stop a running pyautogui script in an emergency?", options: ["Press F5", "Move the mouse quickly to a screen corner", "Close the monitor", "Type 'stop'"], answer: 1, explanation: "With FAILSAFE enabled, a corner position raises FailSafeException." },
    { question: "Where is the coordinate (0, 0) in pyautogui?", options: ["Screen center", "Bottom-left", "Top-left", "Bottom-right"], answer: 2, explanation: "x increases to the right and y increases downward from the top-left corner." },
  ],
};
