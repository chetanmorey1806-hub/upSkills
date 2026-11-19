export default {
  lesson: 'day-25-file-handling',
  minutes: 30,
  intro: 'Open files in the right mode, read and write text with the with statement, and handle missing files safely.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'You want to add new lines to the end of `log.txt` without deleting what is already there. Which mode?',
      options: ['"r"', '"w"', '"a"', '"x"'],
      answer: 2,
      explain: '`"a"` (append) writes at the end and creates the file if needed. `"w"` **erases** the file first, a classic data-loss bug. `"x"` fails if the file exists, `"r"` is read-only.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `with open("demo.txt", "w") as f:
    f.write("one\\ntwo\\n")
with open("demo.txt", "a") as f:
    f.write("three\\n")
with open("demo.txt") as f:
    print(f.readline().strip())
    print(f.readlines())
print(f.closed)`,
      expected: "one\n['two\\n', 'three\\n']\nTrue",
      explain: '`readline()` reads one line (with its `\\n`, removed here by strip). The file position moves on, so `readlines()` returns only the **remaining** lines as a list. The `with` block closes the file automatically, so `f.closed` is True.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Write `save_lines(path, lines)` that writes each string of `lines` to the file **on its own line** (overwriting the file), and `read_lines(path)` that returns the lines as a list **without** the newline characters.\n\nUse `with open(...)`.',
      example: { title: 'writing and reading text', code: 'with open("todo.txt", "w") as f:\n    f.write("buy milk\\n")\n\nwith open("todo.txt") as f:\n    for line in f:\n        print(line.strip())' },
      starter: `def save_lines(path, lines):
    # TODO
    pass

def read_lines(path):
    # TODO
    return []
`,
      solution: `def save_lines(path, lines):
    with open(path, "w") as f:
        for line in lines:
            f.write(line + "\\n")

def read_lines(path):
    with open(path) as f:
        return [line.rstrip("\\n") for line in f]
`,
      tests: [
        { call: 'save_lines("diary.txt", ["Day 1: learnt files", "Day 2: CSV next"])', expect: null },
        { call: 'open("diary.txt").read()', expect: 'Day 1: learnt files\nDay 2: CSV next\n', msg: 'each item must be written on its own line' },
        { call: 'read_lines("diary.txt")', expect: ['Day 1: learnt files', 'Day 2: CSV next'] },
      ],
      explain: '`write()` does **not** add a newline for you: add `"\\n"` yourself (or use `print(line, file=f)`). When reading, each line still ends with `\\n`, so strip it. `with` guarantees the file is closed (and flushed) even if an error happens.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Write `add_entry(path, entry)` that **appends** `entry` as a new line to the file (creating it if needed) and returns the total number of lines now in the file.',
      example: { title: 'append mode', code: 'with open("log.txt", "a") as f:\n    f.write("user logged in\\n")' },
      starter: `def add_entry(path, entry):
    # TODO
    return 0
`,
      solution: `def add_entry(path, entry):
    with open(path, "a") as f:
        f.write(entry + "\\n")
    with open(path) as f:
        return len(f.readlines())
`,
      tests: [
        { call: 'add_entry("visits.txt", "Asha")', expect: 1 },
        { call: 'add_entry("visits.txt", "Ravi")', expect: 2 },
        { call: 'open("visits.txt").read()', expect: 'Asha\nRavi\n' },
      ],
      explain: 'Mode `"a"` keeps the old content, so the count grows with each call. Opening with `"w"` would wipe the file and always return 1. Re-open the file for reading after closing the append handle.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Write `file_stats(path)` that returns a dict `{"lines": n, "words": n, "chars": n}` for a text file, or `None` if the file does not exist (catch `FileNotFoundError`).',
      example: { title: 'handling a missing file', code: 'try:\n    with open("config.txt") as f:\n        data = f.read()\nexcept FileNotFoundError:\n    data = ""' },
      starter: `def file_stats(path):
    # TODO
    pass
`,
      solution: `def file_stats(path):
    try:
        with open(path) as f:
            text = f.read()
    except FileNotFoundError:
        return None
    return {"lines": len(text.splitlines()), "words": len(text.split()), "chars": len(text)}
`,
      tests: [
        { call: 'open("poem.txt", "w").write("Twinkle twinkle\\nlittle star\\n")', expect: 28, msg: '(setup: creating poem.txt)' },
        { call: 'file_stats("poem.txt")', expect: { lines: 2, words: 4, chars: 28 } },
        { call: 'file_stats("no_such_file.txt")', expect: null },
      ],
      explain: '`read()` returns the whole file as one string: `splitlines()` counts lines, `split()` counts words, `len()` counts characters (including the `\\n`s). Catch only `FileNotFoundError` so other problems are not hidden.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are true? (select all that apply)',
      options: [
        '`with open(...) as f:` closes the file even if an exception happens inside the block',
        '`f.write(25)` writes the number 25',
        '`"rb"` opens a file for reading bytes (images, PDFs)',
        '`f.read()` on a 2 GB file is fine for memory',
        'Looping `for line in f:` reads one line at a time',
      ],
      answers: [0, 2, 4],
      explain: '`with` always closes the file. `write()` only accepts strings in text mode, so write `str(25)`. Binary mode (`b`) is for non-text files. `read()` loads the entire file into memory; iterating line by line is memory-friendly for big files.',
    },
  ],
};
