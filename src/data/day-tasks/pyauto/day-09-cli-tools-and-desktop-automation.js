export default {
  lesson: 'day-09-cli-tools-and-desktop-automation',
  minutes: 30,
  intro: 'Turn scripts into command-line tools with argparse (arguments, options, flags, sub-commands, exit codes) and know how click and pyautogui work safely.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What does this print? (argparse with a list instead of the real command line)',
      code: `import argparse
p = argparse.ArgumentParser(prog="report")
p.add_argument("city")
p.add_argument("--days", type=int, default=7)
p.add_argument("--email", action="store_true")
a = p.parse_args(["Pune", "--days", "30"])
print(a.city, a.days, a.email)
b = p.parse_args(["Delhi", "--email"])
print(b.city, b.days, b.email)`,
      expected: 'Pune 30 False\nDelhi 7 True',
      explain: 'Positional arguments (`city`) are required; options (`--days`) are optional and use the default when missing; `type=int` converts the text. `store_true` makes a flag that is False unless given. Passing a list to `parse_args` is how you test a CLI without a terminal.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: 'Write `build_parser()` that returns an `ArgumentParser` for a file tool:\n- positional `folder`\n- `--ext` (default `".csv"`)\n- `--limit` (int, default 10)\n- `--dry-run` flag (store_true; read it as `args.dry_run`)\n- `--mode` with **choices** `"copy"` and `"move"` (default `"copy"`)',
      example: { title: 'choices and flags', code: 'p.add_argument("--format", choices=["pdf", "xlsx"], default="pdf")\np.add_argument("-v", "--verbose", action="store_true")' },
      starter: 'import argparse\n\ndef build_parser():\n    # TODO\n    pass\n',
      solution: 'import argparse\n\ndef build_parser():\n    p = argparse.ArgumentParser(prog="filetool", description="Copy or move files by extension")\n    p.add_argument("folder")\n    p.add_argument("--ext", default=".csv")\n    p.add_argument("--limit", type=int, default=10)\n    p.add_argument("--dry-run", action="store_true")\n    p.add_argument("--mode", choices=["copy", "move"], default="copy")\n    return p\n',
      tests: [
        { call: '(lambda a: [a.folder, a.ext, a.limit, a.dry_run, a.mode])(build_parser().parse_args(["reports"]))', expect: ['reports', '.csv', 10, false, 'copy'] },
        { call: '(lambda a: [a.ext, a.limit, a.dry_run, a.mode])(build_parser().parse_args(["x", "--ext", ".pdf", "--limit", "3", "--dry-run", "--mode", "move"]))', expect: ['.pdf', 3, true, 'move'] },
        { call: '__import__("unittest").TestCase().assertRaises(SystemExit, build_parser().parse_args, ["x", "--mode", "delete"])', expect: null, msg: '--mode must only accept copy or move' },
      ],
      explain: '`--dry-run` becomes the attribute `dry_run` (dashes → underscores). With `choices` argparse rejects invalid values and prints a helpful message, then exits with code 2 (SystemExit). You also get `--help` for free from the arguments you defined.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: '**Sub-commands and exit codes.** Write `main(argv)` for a tool `notes` with two sub-commands:\n- `add TEXT` → appends TEXT as a line to `notes.txt`, prints `Added`, returns 0\n- `count` → prints the number of lines in `notes.txt` (0 if the file does not exist), returns 0\n\nIf no sub-command is given, print `usage: notes {add,count}` and return 1. Use `add_subparsers(dest="cmd")`.',
      example: { title: 'sub-parsers', code: 'sub = parser.add_subparsers(dest="cmd")\nsend = sub.add_parser("send")\nsend.add_argument("to")\nargs = parser.parse_args(["send", "asha@x.in"])\nargs.cmd   # "send"' },
      starter: 'import argparse\nfrom pathlib import Path\n\ndef main(argv):\n    # TODO\n    pass\n',
      solution: `import argparse
from pathlib import Path

def main(argv):
    p = argparse.ArgumentParser(prog="notes")
    sub = p.add_subparsers(dest="cmd")
    add = sub.add_parser("add")
    add.add_argument("text")
    sub.add_parser("count")
    args = p.parse_args(argv)
    f = Path("notes.txt")
    if args.cmd == "add":
        with f.open("a", encoding="utf-8") as fh:
            fh.write(args.text + "\\n")
        print("Added")
        return 0
    if args.cmd == "count":
        print(len(f.read_text(encoding="utf-8").splitlines()) if f.exists() else 0)
        return 0
    print("usage: notes {add,count}")
    return 1
`,
      tests: [
        { call: 'main(["count"])', expect: 0 },
        { call: '[main(["add", "Call Ravi"]), main(["add", "Send GST file"]), open("notes.txt").read().splitlines()]', expect: [0, 0, ['Call Ravi', 'Send GST file']] },
        { call: 'main([])', expect: 1 },
      ],
      explain: 'Sub-commands give one tool several actions, like `git add` / `git commit`. Returning an **exit code** (0 = success, non-zero = error) and calling `sys.exit(main(sys.argv[1:]))` lets schedulers and shell scripts detect failures. Taking `argv` as a parameter keeps `main` testable.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'With **click**, how is the option `--count` declared for a command?',
      options: ['@click.option("--count", default=1, help="Number of greetings")', 'click.add_argument("--count")', '@click.flag("count")', 'def hello(--count=1):'],
      answer: 0,
      explain: 'click builds the CLI from decorators: `@click.command()` + `@click.option(...)` / `@click.argument(...)` above the function, whose parameters receive the values. `click.testing.CliRunner().invoke(hello, ["--count", "2"])` tests it without a terminal.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about **pyautogui** are TRUE? (choose all that apply)',
      options: ['Moving the mouse to a screen corner triggers the FAILSAFE and stops the script', '`pyautogui.PAUSE = 0.5` adds a pause after every call', '`pyautogui.locateOnScreen("ok_button.png")` finds a button by image instead of fixed coordinates', 'It is the best tool when the application has an API', '`pyautogui.hotkey("ctrl", "s")` presses Ctrl+S'],
      answers: [0, 1, 2, 4],
      explain: 'pyautogui controls the real mouse and keyboard, so it is the **last resort** for apps with no API, file export or command line. Keep FAILSAFE on, add pauses, prefer image matching over hard-coded coordinates (screen resolution changes), and never run it while you are typing elsewhere.',
    },
  ],
};
