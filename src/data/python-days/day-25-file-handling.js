export default {
  id: "day-25-file-handling",
  title: "File Handling: open modes, read/write, with statement",
  module: "Module 4: Exceptions & Files",
  day: 25,
  level: "Intermediate",
  duration: "2 hours",
  summary: "Store data permanently in files: open files in the right mode, read them whole, line by line or in chunks, write and append text, use the with statement to close files automatically, and handle file errors safely.",
  objectives: [
    "Open files with the correct mode (r, w, a, x, r+, b)",
    "Read using read(), readline(), readlines() and iteration",
    "Write and append using write() and writelines()",
    "Use the with statement and explain why it is preferred",
    "Handle FileNotFoundError and work with paths using os/pathlib",
  ],
  theory: [
    {
      heading: "Why Files?",
      content: "Variables live in RAM and disappear when the program ends. Files store data permanently on disk - logs, reports, settings, user data. Working with a file is like using a notebook: open it, read or write, then close it. Forgetting to close can lose data that is still in the buffer and keeps the file locked.",
      syntax: `f = open("notes.txt", "r", encoding="utf-8")
content = f.read()
f.close()
`,
    },
    {
      heading: "File Modes",
      content: "The second argument of open() is the mode.",
      points: [
        "\"r\" read (default) - error if the file does not exist",
        "\"w\" write - creates the file or ERASES existing content",
        "\"a\" append - creates or adds to the end, keeps old content",
        "\"x\" exclusive create - error if the file already exists",
        "\"r+\" read and write an existing file",
        "Add \"b\" for binary files (images, PDFs): \"rb\", \"wb\"",
        "Add \"t\" for text (default)",
      ],
      tip: "Always pass encoding=\"utf-8\" for text files so the code behaves the same on Windows and Linux (Hindi/emoji text included).",
    },
    {
      heading: "Reading Methods",
      content: "read() returns the whole file as one string. read(n) reads n characters. readline() reads one line (including the \\n). readlines() returns a list of all lines. Looping directly with for line in f reads line by line and is the most memory-efficient for big files. The file pointer moves forward as you read; tell() gives its position and seek(0) goes back to the start.",
      syntax: `with open("data.txt", encoding="utf-8") as f:
    for line in f:
        print(line.strip())
`,
    },
    {
      heading: "Writing Methods",
      content: "write(text) writes a string and returns the number of characters written; it does NOT add a newline automatically. writelines(list_of_strings) writes many strings (again, add \\n yourself). print(..., file=f) is a handy way to write a line with a newline.",
      syntax: `with open("log.txt", "a", encoding="utf-8") as f:
    f.write("User logged in\\n")
    f.writelines(["line1\\n", "line2\\n"])
    print("line3", file=f)
`,
    },
    {
      heading: "The with Statement (Context Manager)",
      content: "with open(...) as f: opens the file and automatically closes it when the block ends - even if an exception happens inside. It is shorter and safer than calling close() yourself. Analogy: an automatic door that always shuts behind you. You can open two files in one with: with open(\"a.txt\") as src, open(\"b.txt\", \"w\") as dst:",
      tip: "After the with block, f.closed is True. Reading a closed file raises ValueError: I/O operation on closed file.",
    },
    {
      heading: "Paths and File Errors",
      content: "Use os.path.exists() or pathlib.Path(\"x\").exists() to check files. Common exceptions: FileNotFoundError (reading a missing file), FileExistsError (mode \"x\" on an existing file), PermissionError, IsADirectoryError. pathlib.Path offers an object-oriented API: Path(\"data\") / \"file.txt\", .read_text(), .write_text(), .suffix, .stem, .glob(\"*.txt\").",
    },
  ],
  examples: [
    {
      title: "Write, Append and Read a Diary",
      scenario: "A diary app writes the first entry, appends more entries later and reads everything back.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `with open("diary.txt", "w", encoding="utf-8") as f:
    count = f.write("Day 1: Started learning Python files\\n")
    print("characters written:", count)

with open("diary.txt", "a", encoding="utf-8") as f:
    f.write("Day 2: Learned append mode\\n")
    f.writelines(["Day 3: with statement\\n", "Day 4: pathlib\\n"])
    print("Day 5: print to file", file=f)

with open("diary.txt", encoding="utf-8") as f:
    print(f.read())

print("closed after with?", f.closed)
`,
      python: {
        files: {
          "main.py": `with open("diary.txt", "w", encoding="utf-8") as f:
    count = f.write("Day 1: Started learning Python files\\n")
    print("characters written:", count)

with open("diary.txt", "a", encoding="utf-8") as f:
    f.write("Day 2: Learned append mode\\n")
    f.writelines(["Day 3: with statement\\n", "Day 4: pathlib\\n"])
    print("Day 5: print to file", file=f)

with open("diary.txt", encoding="utf-8") as f:
    print(f.read())

print("closed after with?", f.closed)
`,
        },
      },
      result: `characters written: 37
Day 1: Started learning Python files
Day 2: Learned append mode
Day 3: with statement
Day 4: pathlib
Day 5: print to file

closed after with? True`,
      explanation: "\"w\" creates the file (erasing old content). \"a\" adds to the end. write() returns the number of characters and needs explicit \\n. read() returns the whole content. After the with block the file is closed automatically.",
    },
    {
      title: "Different Ways to Read",
      scenario: "Read a marks file using read(n), readline(), readlines(), iteration, tell() and seek().",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `with open("marks.txt", "w") as f:
    f.write("Asha,92\\nRavi,78\\nNeha,85\\nOm,64\\n")

with open("marks.txt") as f:
    print(repr(f.read(4)))        # first 4 characters
    print("pointer at:", f.tell())
    print(repr(f.readline()))     # rest of line 1
    print(repr(f.readline()))     # line 2
    f.seek(0)                     # back to start
    print(f.readlines())

total = 0
with open("marks.txt") as f:
    for line in f:                # memory efficient
        name, mark = line.strip().split(",")
        total += int(mark)
        print(f"{name:<5}{mark:>4}")
print("Average:", total / 4)
`,
      python: {
        files: {
          "main.py": `with open("marks.txt", "w") as f:
    f.write("Asha,92\\nRavi,78\\nNeha,85\\nOm,64\\n")

with open("marks.txt") as f:
    print(repr(f.read(4)))        # first 4 characters
    print("pointer at:", f.tell())
    print(repr(f.readline()))     # rest of line 1
    print(repr(f.readline()))     # line 2
    f.seek(0)                     # back to start
    print(f.readlines())

total = 0
with open("marks.txt") as f:
    for line in f:                # memory efficient
        name, mark = line.strip().split(",")
        total += int(mark)
        print(f"{name:<5}{mark:>4}")
print("Average:", total / 4)
`,
        },
      },
      result: `'Asha'
pointer at: 4
',92\\n'
'Ravi,78\\n'
['Asha,92\\n', 'Ravi,78\\n', 'Neha,85\\n', 'Om,64\\n']
Asha   92
Ravi   78
Neha   85
Om     64
Average: 79.75`,
      explanation: "read(4) reads \"Asha\". readline() continues from the current pointer position. seek(0) rewinds. readlines() returns a list with \\n characters. Iterating over the file object processes one line at a time, ideal for large files.",
    },
    {
      title: "Copy and Transform a File (two files in one with)",
      scenario: "Read a raw to-do list and write a cleaned, numbered version to a new file.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `with open("todo_raw.txt", "w") as f:
    f.write("  buy milk \\n\\nCALL mom\\n  pay electricity bill\\n\\n")

with open("todo_raw.txt") as src, open("todo_clean.txt", "w") as dst:
    n = 0
    for line in src:
        task = line.strip()
        if not task:
            continue
        n += 1
        dst.write(f"{n}. {task.capitalize()}\\n")

with open("todo_clean.txt") as f:
    print(f.read(), end="")
print("Tasks:", n)
`,
      python: {
        files: {
          "main.py": `with open("todo_raw.txt", "w") as f:
    f.write("  buy milk \\n\\nCALL mom\\n  pay electricity bill\\n\\n")

with open("todo_raw.txt") as src, open("todo_clean.txt", "w") as dst:
    n = 0
    for line in src:
        task = line.strip()
        if not task:
            continue
        n += 1
        dst.write(f"{n}. {task.capitalize()}\\n")

with open("todo_clean.txt") as f:
    print(f.read(), end="")
print("Tasks:", n)
`,
        },
      },
      result: `1. Buy milk
2. Call mom
3. Pay electricity bill
Tasks: 3`,
      explanation: "Two files are opened in a single with statement. Blank lines are skipped, each task is stripped and capitalised, and numbered lines are written to the new file.",
    },
    {
      title: "Handling File Errors and Modes x / r+",
      scenario: "Safely read a file that may not exist, prevent overwriting with mode \"x\", and update a file in place.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `from pathlib import Path

def read_safely(name):
    try:
        with open(name) as f:
            return f.read()
    except FileNotFoundError:
        return f"[{name} not found]"

print(read_safely("missing.txt"))

with open("config.txt", "x") as f:
    f.write("theme=light\\n")
try:
    with open("config.txt", "x") as f:
        f.write("theme=dark\\n")
except FileExistsError as e:
    print("FileExistsError:", e.strerror)

with open("config.txt", "r+") as f:
    text = f.read()
    f.seek(0)
    f.write(text.replace("light", "dark"))
    f.truncate()      # cut off leftover old characters
print(read_safely("config.txt"), end="")

p = Path("config.txt")
print(p.exists(), p.suffix, p.stem, p.stat().st_size)
Path("hello.txt").write_text("Hi from pathlib")
print(Path("hello.txt").read_text())
`,
      python: {
        files: {
          "main.py": `from pathlib import Path

def read_safely(name):
    try:
        with open(name) as f:
            return f.read()
    except FileNotFoundError:
        return f"[{name} not found]"

print(read_safely("missing.txt"))

with open("config.txt", "x") as f:
    f.write("theme=light\\n")
try:
    with open("config.txt", "x") as f:
        f.write("theme=dark\\n")
except FileExistsError as e:
    print("FileExistsError:", e.strerror)

with open("config.txt", "r+") as f:
    text = f.read()
    f.seek(0)
    f.write(text.replace("light", "dark"))
    f.truncate()      # cut off leftover old characters
print(read_safely("config.txt"), end="")

p = Path("config.txt")
print(p.exists(), p.suffix, p.stem, p.stat().st_size)
Path("hello.txt").write_text("Hi from pathlib")
print(Path("hello.txt").read_text())
`,
        },
      },
      result: `[missing.txt not found]
FileExistsError: File exists
theme=dark
True .txt config 11
Hi from pathlib`,
      explanation: "FileNotFoundError is handled with a friendly message. Mode \"x\" refuses to overwrite an existing file. \"r+\" reads, then writes back from position 0; because the new text is shorter, truncate() removes the leftover characters of the old text. pathlib gives easy helpers like exists(), suffix, stem, read_text() and write_text().",
    },
  ],
  interview: [
    {
      q: "What is the difference between \"w\" and \"a\" modes?",
      a: "\"w\" truncates (erases) the file or creates it, then writes from the start. \"a\" creates it if needed and always writes at the end, keeping existing content.",
      level: "Easy",
    },
    {
      q: "Why is the with statement preferred for files?",
      a: "It automatically closes the file when the block ends, even if an exception occurs, preventing resource leaks and lost buffered data. It is cleaner than try/finally with close().",
      level: "Easy",
    },
    {
      q: "What is the difference between read(), readline() and readlines()?",
      a: "read() returns the entire file (or n characters) as one string; readline() returns the next single line; readlines() returns a list of all remaining lines.",
      level: "Easy",
    },
    {
      q: "How do you read a very large file efficiently?",
      a: "Iterate over the file object (for line in f), or read fixed-size chunks with f.read(size) in a loop, so the whole file is never loaded into memory.",
      level: "Medium",
    },
    {
      q: `What is the output of this code?

with open("t.txt", "w") as f:
    f.write("one\\ntwo\\n")
with open("t.txt", "a") as f:
    f.write("three")
with open("t.txt") as f:
    print(f.readlines())
`,
      a: `Output:
['one\\n', 'two\\n', 'three']

"w" writes two lines, "a" appends "three" without a newline. readlines keeps the \\n characters.`,
      level: "Medium",
    },
    {
      q: `What is the output of this code?

with open("t.txt", "w") as f:
    n = f.write("hello\\n")
print(n)
with open("t.txt") as f:
    f.read()
    print(repr(f.read()))
`,
      a: `Output:
6
''

write returns the number of characters written (6 including \\n). The second read() returns an empty string because the pointer is already at the end.`,
      level: "Hard",
    },
    {
      q: "What does mode \"x\" do?",
      a: "Exclusive creation: creates a new file and raises FileExistsError if it already exists. Useful to avoid accidentally overwriting.",
      level: "Medium",
    },
    {
      q: "What do seek() and tell() do?",
      a: "tell() returns the current position of the file pointer; seek(offset) moves the pointer, e.g. seek(0) goes back to the beginning.",
      level: "Medium",
    },
    {
      q: "Why should you pass encoding=\"utf-8\"?",
      a: "The default encoding depends on the operating system (e.g. cp1252 on older Windows). Explicit UTF-8 avoids UnicodeDecodeError and makes the code portable.",
      level: "Medium",
    },
    {
      q: "Which mode would you use to open an image file for reading?",
      a: "\"rb\" - read binary. Binary mode returns bytes and does no newline or encoding conversion.",
      level: "Easy",
    },
  ],
  practice: [
    {
      task: "Write a program that writes 5 names to names.txt (one per line) and then prints how many lines the file has.",
      hint: "Use writelines or a loop with write, then len(f.readlines()).",
      solution: `names = ["Asha", "Ravi", "Neha", "Om", "Kiran"]
with open("names.txt", "w") as f:
    for n in names:
        f.write(n + "\\n")
with open("names.txt") as f:
    print(len(f.readlines()))
`,
    },
    {
      task: "Count the words, lines and characters of a text file (like the wc command).",
      hint: "Read the file once, use splitlines(), split() and len().",
      solution: `with open("story.txt", "w") as f:
    f.write("Python is fun\\nFiles are easy\\n")
with open("story.txt") as f:
    text = f.read()
print("lines:", len(text.splitlines()), "words:", len(text.split()), "chars:", len(text))
`,
    },
    {
      task: "Write a function log(message) that appends a line \"[n] message\" to app.log, then print the log file after 3 calls.",
      hint: "Count existing lines to get n, or keep a counter.",
      solution: `import os
def log(message):
    n = 1
    if os.path.exists("app.log"):
        with open("app.log") as f:
            n = len(f.readlines()) + 1
    with open("app.log", "a") as f:
        f.write(f"[{n}] {message}\\n")

if os.path.exists("app.log"):
    os.remove("app.log")
for m in ["start", "login", "logout"]:
    log(m)
print(open("app.log").read(), end="")
`,
    },
    {
      task: "Copy a binary file in chunks of 4 bytes using \"rb\" and \"wb\", then check that both files are equal.",
      hint: "while chunk := src.read(4): dst.write(chunk)",
      solution: `with open("a.bin", "wb") as f:
    f.write(bytes(range(10)))
with open("a.bin", "rb") as src, open("b.bin", "wb") as dst:
    while chunk := src.read(4):
        dst.write(chunk)
print(open("a.bin", "rb").read() == open("b.bin", "rb").read())
`,
    },
    {
      task: "Find and print all lines containing the word \"error\" (case-insensitive) with their line numbers.",
      hint: "for no, line in enumerate(f, 1): if \"error\" in line.lower()",
      solution: `with open("server.log", "w") as f:
    f.write("start ok\\nERROR disk full\\nuser login\\nError timeout\\n")
with open("server.log") as f:
    for no, line in enumerate(f, 1):
        if "error" in line.lower():
            print(no, line.strip())
`,
    },
  ],
  quiz: [
    {
      question: "Which mode erases existing content before writing?",
      options: [
        "\"a\"",
        "\"r+\"",
        "\"w\"",
        "\"x\"",
      ],
      answer: 2,
      explanation: "\"w\" truncates the file.",
    },
    {
      question: "What exception is raised when opening a missing file in \"r\" mode?",
      options: [
        "FileNotFoundError",
        "IOError only",
        "KeyError",
        "FileExistsError",
      ],
      answer: 0,
      explanation: "Reading a non-existent file raises FileNotFoundError.",
    },
    {
      question: "What does f.write(\"hi\") return?",
      options: [
        "None",
        "True",
        "The file object",
        "2",
      ],
      answer: 3,
      explanation: "write returns the number of characters written.",
    },
    {
      question: "Which reads ALL lines into a list?",
      options: [
        "read()",
        "readlines()",
        "readline()",
        "list(read)",
      ],
      answer: 1,
      explanation: "readlines() returns a list of lines.",
    },
    {
      question: "What is the main benefit of with open(...) as f?",
      options: [
        "Faster reading",
        "Automatic closing of the file",
        "Automatic encryption",
        "Allows only reading",
      ],
      answer: 1,
      explanation: "The context manager closes the file automatically, even on errors.",
    },
  ],
};
