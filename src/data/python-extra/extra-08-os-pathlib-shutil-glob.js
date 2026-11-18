export default {
  id: "extra-08-os-pathlib-shutil-glob",
  title: "os, pathlib, shutil and glob: Files and Folders Automation",
  module: "Module 2: Standard Library Power Tools",
  extraNo: 8,
  level: "Intermediate",
  duration: "2.5 hours",
  summary: "Automate file-system work in a cross-platform way: build and inspect paths with pathlib, read and write files, create and walk directories, copy/move/archive with shutil, find files with glob patterns, and use os for environment info, permissions and directory walking. These skills power scripts for log cleanup, report organisation and deployments.",
  objectives: [
    "Build cross-platform paths with pathlib.Path and the / operator",
    "Read, write, create, rename and delete files and folders",
    "Find files with glob / rglob patterns and walk directory trees",
    "Copy, move, delete trees and create zip archives with shutil",
    "Know when to use os / os.path versus pathlib",
  ],
  theory: [
    {
      heading: "Why pathlib?",
      content: `Paths look different on each OS: Windows uses \`C:\\Users\\asha\\report.csv\`, Linux/macOS use \`/home/asha/report.csv\`. Building paths by string concatenation causes bugs. \`pathlib\` (Python 3.4+) represents paths as objects. \`Path\` automatically becomes \`WindowsPath\` or \`PosixPath\` for your OS, and you join parts with the \`/\` operator.

A Path object has handy properties: \`.name\` (file name), \`.stem\` (name without extension), \`.suffix\` (extension), \`.parent\` (folder), \`.parts\`, and methods like \`.exists()\`, \`.is_file()\`, \`.is_dir()\`, \`.resolve()\` (absolute path).`,
      syntax: `from pathlib import Path
base = Path("reports")
file = base / "2025" / "sales.csv"
file.name      # 'sales.csv'
file.stem      # 'sales'
file.suffix    # '.csv'
file.parent    # reports/2025
Path.cwd(), Path.home()
`,
    },
    {
      heading: "Reading, Writing and Managing Files with Path",
      content: `Path has convenient one-line methods: \`read_text()\`, \`write_text()\`, \`read_bytes()\`, \`write_bytes()\`. For large files or line-by-line processing, use \`path.open()\` in a \`with\` block. Always pass \`encoding="utf-8"\` for text so the code behaves the same on Windows (whose default encoding may differ).

Folder and file operations: \`mkdir(parents=True, exist_ok=True)\` creates nested folders safely, \`touch()\` creates an empty file, \`rename()\` / \`replace()\` move or rename, \`unlink(missing_ok=True)\` deletes a file, \`rmdir()\` deletes an EMPTY folder, \`stat()\` gives size and modified time, \`with_suffix()\` / \`with_name()\` return changed paths.`,
      points: [
        "`iterdir()` lists the direct children of a folder",
        "`p.stat().st_size` - size in bytes; `st_mtime` - last modified timestamp",
        "`p.relative_to(base)` - path relative to another",
        "`rename` fails on Windows if the target exists; `replace` overwrites",
      ],
    },
    {
      heading: "Finding Files: glob and rglob",
      content: `Glob patterns are simple wildcards: \`*\` matches anything except a path separator, \`?\` matches one character, \`[abc]\` matches one of the characters, and \`**\` matches any number of folders (recursive). \`Path.glob("*.csv")\` searches one folder; \`Path.rglob("*.csv")\` searches all subfolders (same as \`glob("**/*.csv")\`).

The \`glob\` module does the same with strings: \`glob.glob("logs/**/*.log", recursive=True)\`. Results are not guaranteed to be sorted, so wrap them in \`sorted()\` for stable output.`,
      syntax: `sorted(Path("data").glob("*.csv"))
sorted(Path("data").rglob("*.json"))
import glob
glob.glob("data/report_202?.xlsx")
`,
    },
    {
      heading: "shutil: High-level File Operations",
      content: "`shutil` (shell utilities) works with whole files and trees: `copy(src, dst)` copies content and permissions, `copy2` also preserves timestamps, `copytree(src, dst, dirs_exist_ok=True)` copies a whole folder, `move(src, dst)` moves a file or folder (even across drives), `rmtree(path)` deletes a folder with everything inside - **permanently, no recycle bin**. `make_archive(base_name, 'zip', root_dir)` creates zip/tar archives, `unpack_archive` extracts them, `disk_usage(path)` shows total/used/free space and `which('git')` finds an executable on PATH.",
      tip: "Double-check paths before calling shutil.rmtree. A wrong variable can delete a whole project. Print the path or do a dry run first.",
    },
    {
      heading: "The os Module",
      content: `\`os\` is the lower-level interface to the operating system. You still need it for: \`os.environ\` (environment variables), \`os.getcwd()\` / \`os.chdir()\`, \`os.walk()\` (walk a tree yielding (dirpath, dirnames, filenames)), \`os.listdir()\`, \`os.remove()\`, \`os.makedirs()\`, \`os.getpid()\`, \`os.cpu_count()\`, \`os.sep\` and \`os.linesep\`. \`os.path\` has the old string-based path functions: \`join\`, \`exists\`, \`basename\`, \`dirname\`, \`splitext\`, \`getsize\`, \`abspath\`.

In new code, prefer pathlib for paths; use os for environment, processes and os.walk (or \`Path.walk()\` in 3.12+).`,
      points: [
        "os.path.join('a', 'b.txt') ≈ Path('a') / 'b.txt'",
        "os.path.splitext('x.tar.gz') -> ('x.tar', '.gz')",
        "os.walk is top-down by default; you can prune by editing dirnames in place",
      ],
    },
    {
      heading: "Safe File Handling Practices",
      content: "Real automation scripts must be robust. Check existence or handle `FileNotFoundError`, `FileExistsError`, `PermissionError` and `IsADirectoryError`. Use `exist_ok=True` / `missing_ok=True` to make scripts re-runnable (idempotent). For important files, write to a temporary file and then `replace()` it into place, so a crash never leaves a half-written file. Use the `tempfile` module for temporary files and folders that clean themselves up.",
      syntax: `import tempfile
with tempfile.TemporaryDirectory() as tmp:
    p = Path(tmp) / "scratch.txt"
    p.write_text("temporary data", encoding="utf-8")
# folder and file are deleted here
`,
    },
  ],
  examples: [
    {
      title: "Exploring Path Objects",
      scenario: "A data analyst needs to extract parts of report file paths to rename and organise them.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `from pathlib import Path, PurePosixPath, PureWindowsPath

p = PurePosixPath("/home/asha/reports/2025/sales_q1.final.csv")
print("name  :", p.name)
print("stem  :", p.stem)
print("suffix:", p.suffix, p.suffixes)
print("parent:", p.parent)
print("parts :", p.parts[-3:])
print("as xlsx:", p.with_suffix(".xlsx").name)
print("renamed:", p.with_name("summary.csv"))
print("relative:", p.relative_to("/home/asha"))

w = PureWindowsPath(r"C:\\Users\\Asha\\Desktop\\notes.txt")
print(w.drive, w.name, w.parent)

base = Path("project")
print(base / "src" / "main.py")
print(Path("data/../data/./input.csv").as_posix())
`,
      python: {
        files: {
          "main.py": `from pathlib import Path, PurePosixPath, PureWindowsPath

p = PurePosixPath("/home/asha/reports/2025/sales_q1.final.csv")
print("name  :", p.name)
print("stem  :", p.stem)
print("suffix:", p.suffix, p.suffixes)
print("parent:", p.parent)
print("parts :", p.parts[-3:])
print("as xlsx:", p.with_suffix(".xlsx").name)
print("renamed:", p.with_name("summary.csv"))
print("relative:", p.relative_to("/home/asha"))

w = PureWindowsPath(r"C:\\Users\\Asha\\Desktop\\notes.txt")
print(w.drive, w.name, w.parent)

base = Path("project")
print(base / "src" / "main.py")
print(Path("data/../data/./input.csv").as_posix())
`,
        },
      },
      result: `name  : sales_q1.final.csv
stem  : sales_q1.final
suffix: .csv ['.final', '.csv']
parent: /home/asha/reports/2025
parts : ('reports', '2025', 'sales_q1.final.csv')
as xlsx: sales_q1.final.xlsx
renamed: /home/asha/reports/2025/summary.csv
relative: reports/2025/sales_q1.final.csv
C: notes.txt C:\\Users\\Asha\\Desktop
project/src/main.py
data/../data/input.csv`,
      explanation: "Pure paths let us demonstrate Windows and Linux paths on any OS without touching the disk. name/stem/suffix split the file name; with_suffix and with_name return new paths. The / operator joins parts portably.",
    },
    {
      title: "Creating, Writing, Listing and Deleting Files",
      scenario: "A script sets up a folder structure for monthly reports, writes files, lists them with sizes and cleans up.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `from pathlib import Path
import shutil

root = Path("demo_reports")
for month in ["jan", "feb"]:
    (root / month).mkdir(parents=True, exist_ok=True)

(root / "jan" / "sales.csv").write_text("id,amount\\n1,500\\n2,700\\n", encoding="utf-8")
(root / "jan" / "notes.txt").write_text("Check returns", encoding="utf-8")
(root / "feb" / "sales.csv").write_text("id,amount\\n1,900\\n", encoding="utf-8")

for folder in sorted(root.iterdir()):
    print(folder.name + "/")
    for f in sorted(folder.iterdir()):
        print(f"   {f.name:<10} {f.stat().st_size:>3} bytes")

csv = root / "jan" / "sales.csv"
with csv.open(encoding="utf-8") as fh:
    next(fh)
    total = sum(int(line.split(",")[1]) for line in fh)
print("Jan total:", total)

(root / "jan" / "notes.txt").rename(root / "jan" / "notes_old.txt")
print(sorted(p.name for p in (root / "jan").iterdir()))
(root / "jan" / "missing.txt").unlink(missing_ok=True)

shutil.rmtree(root)
print("exists after cleanup?", root.exists())
`,
      python: {
        files: {
          "main.py": `from pathlib import Path
import shutil

root = Path("demo_reports")
for month in ["jan", "feb"]:
    (root / month).mkdir(parents=True, exist_ok=True)

(root / "jan" / "sales.csv").write_text("id,amount\\n1,500\\n2,700\\n", encoding="utf-8")
(root / "jan" / "notes.txt").write_text("Check returns", encoding="utf-8")
(root / "feb" / "sales.csv").write_text("id,amount\\n1,900\\n", encoding="utf-8")

for folder in sorted(root.iterdir()):
    print(folder.name + "/")
    for f in sorted(folder.iterdir()):
        print(f"   {f.name:<10} {f.stat().st_size:>3} bytes")

csv = root / "jan" / "sales.csv"
with csv.open(encoding="utf-8") as fh:
    next(fh)
    total = sum(int(line.split(",")[1]) for line in fh)
print("Jan total:", total)

(root / "jan" / "notes.txt").rename(root / "jan" / "notes_old.txt")
print(sorted(p.name for p in (root / "jan").iterdir()))
(root / "jan" / "missing.txt").unlink(missing_ok=True)

shutil.rmtree(root)
print("exists after cleanup?", root.exists())
`,
        },
      },
      result: `feb/
   sales.csv   16 bytes
jan/
   notes.txt   13 bytes
   sales.csv   22 bytes
Jan total: 1200
['notes_old.txt', 'sales.csv']
exists after cleanup? False`,
      explanation: "mkdir(parents=True, exist_ok=True) builds nested folders and can be re-run safely. write_text/open handle text with explicit UTF-8. iterdir lists children; stat gives sizes. rename moves the file; unlink(missing_ok=True) ignores missing files; rmtree removes the demo tree.",
    },
    {
      title: "Finding Files with glob, rglob and os.walk",
      scenario: "A DevOps engineer wants to find all log files and the biggest CSV in a project tree.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `from pathlib import Path
import glob
import os
import shutil

root = Path("proj")
files = {
    "app.log": "x" * 50, "src/main.py": "print(1)", "src/util.py": "",
    "data/a.csv": "1,2\\n" * 10, "data/b.csv": "1\\n", "data/old/2023.csv": "z" * 300,
    "logs/err.log": "e" * 20, "logs/2025/jan.log": "j" * 5,
}
for rel, content in files.items():
    path = root / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content)

print("Top-level logs:", [p.name for p in sorted(root.glob("*.log"))])
print("All logs     :", [p.relative_to(root).as_posix() for p in sorted(root.rglob("*.log"))])
print("Python files :", sorted(Path(p).name for p in glob.glob("proj/**/*.py", recursive=True)))

biggest = max(root.rglob("*.csv"), key=lambda p: p.stat().st_size)
print("Biggest CSV  :", biggest.relative_to(root).as_posix(), biggest.stat().st_size, "bytes")

for dirpath, dirnames, filenames in os.walk(root):
    dirnames[:] = sorted(d for d in dirnames if d != "old")
    depth = len(Path(dirpath).relative_to(root).parts)
    print("  " * depth + Path(dirpath).name + "/", sorted(filenames))

shutil.rmtree(root)
`,
      python: {
        files: {
          "main.py": `from pathlib import Path
import glob
import os
import shutil

root = Path("proj")
files = {
    "app.log": "x" * 50, "src/main.py": "print(1)", "src/util.py": "",
    "data/a.csv": "1,2\\n" * 10, "data/b.csv": "1\\n", "data/old/2023.csv": "z" * 300,
    "logs/err.log": "e" * 20, "logs/2025/jan.log": "j" * 5,
}
for rel, content in files.items():
    path = root / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content)

print("Top-level logs:", [p.name for p in sorted(root.glob("*.log"))])
print("All logs     :", [p.relative_to(root).as_posix() for p in sorted(root.rglob("*.log"))])
print("Python files :", sorted(Path(p).name for p in glob.glob("proj/**/*.py", recursive=True)))

biggest = max(root.rglob("*.csv"), key=lambda p: p.stat().st_size)
print("Biggest CSV  :", biggest.relative_to(root).as_posix(), biggest.stat().st_size, "bytes")

for dirpath, dirnames, filenames in os.walk(root):
    dirnames[:] = sorted(d for d in dirnames if d != "old")
    depth = len(Path(dirpath).relative_to(root).parts)
    print("  " * depth + Path(dirpath).name + "/", sorted(filenames))

shutil.rmtree(root)
`,
        },
      },
      result: `Top-level logs: ['app.log']
All logs     : ['app.log', 'logs/2025/jan.log', 'logs/err.log']
Python files : ['main.py', 'util.py']
Biggest CSV  : data/old/2023.csv 300 bytes
proj/ ['app.log']
  data/ ['a.csv', 'b.csv']
  logs/ ['err.log']
    2025/ ['jan.log']
  src/ ['main.py', 'util.py']`,
      explanation: "glob('*.log') searches only the top folder; rglob searches recursively. glob.glob with ** and recursive=True does the same with strings. max with a key finds the largest file. In os.walk, editing dirnames in place prunes folders (we skip 'old').",
    },
    {
      title: "Organising Downloads by Extension with shutil",
      scenario: "A messy Downloads folder must be organised into Images, Documents and Others, then backed up as a zip archive.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `from pathlib import Path
import shutil

downloads = Path("downloads_demo")
downloads.mkdir(exist_ok=True)
for name in ["photo.JPG", "resume.pdf", "notes.docx", "song.mp3", "chart.png", "data.xlsx"]:
    (downloads / name).write_text("dummy")

categories = {
    "Images": {".jpg", ".jpeg", ".png", ".gif"},
    "Documents": {".pdf", ".docx", ".xlsx", ".txt"},
}

moved = 0
for f in sorted(downloads.iterdir()):
    if not f.is_file():
        continue
    folder = next((cat for cat, exts in categories.items() if f.suffix.lower() in exts), "Others")
    target = downloads / folder
    target.mkdir(exist_ok=True)
    shutil.move(str(f), target / f.name)
    moved += 1
print("Moved", moved, "files")

for folder in sorted(downloads.iterdir()):
    print(folder.name, sorted(p.name for p in folder.iterdir()))

shutil.copytree(downloads, "downloads_backup", dirs_exist_ok=True)
archive = shutil.make_archive("downloads_archive", "zip", root_dir=downloads)
print("Archive:", Path(archive).name, Path(archive).stat().st_size > 0)

for p in [downloads, Path("downloads_backup")]:
    shutil.rmtree(p)
Path(archive).unlink()
print("Cleaned up")
`,
      python: {
        files: {
          "main.py": `from pathlib import Path
import shutil

downloads = Path("downloads_demo")
downloads.mkdir(exist_ok=True)
for name in ["photo.JPG", "resume.pdf", "notes.docx", "song.mp3", "chart.png", "data.xlsx"]:
    (downloads / name).write_text("dummy")

categories = {
    "Images": {".jpg", ".jpeg", ".png", ".gif"},
    "Documents": {".pdf", ".docx", ".xlsx", ".txt"},
}

moved = 0
for f in sorted(downloads.iterdir()):
    if not f.is_file():
        continue
    folder = next((cat for cat, exts in categories.items() if f.suffix.lower() in exts), "Others")
    target = downloads / folder
    target.mkdir(exist_ok=True)
    shutil.move(str(f), target / f.name)
    moved += 1
print("Moved", moved, "files")

for folder in sorted(downloads.iterdir()):
    print(folder.name, sorted(p.name for p in folder.iterdir()))

shutil.copytree(downloads, "downloads_backup", dirs_exist_ok=True)
archive = shutil.make_archive("downloads_archive", "zip", root_dir=downloads)
print("Archive:", Path(archive).name, Path(archive).stat().st_size > 0)

for p in [downloads, Path("downloads_backup")]:
    shutil.rmtree(p)
Path(archive).unlink()
print("Cleaned up")
`,
        },
      },
      result: `Moved 6 files
Documents ['data.xlsx', 'notes.docx', 'resume.pdf']
Images ['chart.png', 'photo.JPG']
Others ['song.mp3']
Archive: downloads_archive.zip True
Cleaned up`,
      explanation: "suffix.lower() makes '.JPG' match '.jpg'. next() with a default picks the first matching category or 'Others'. shutil.move relocates files, copytree copies the whole tree and make_archive zips it.",
    },
    {
      title: "os Module Essentials and Safe Writes",
      scenario: "A deployment script reads environment info and writes a config file atomically so a crash never leaves a broken file.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import os
import tempfile
from pathlib import Path

print("Separator:", repr(os.sep))
print("Has CPUs :", (os.cpu_count() or 1) >= 1)
print("APP_ENV  :", os.environ.get("APP_ENV", "development"))
print(os.path.join("config", "app.ini"))
print(os.path.splitext("backup.tar.gz"))
print(os.path.basename("/var/log/nginx/access.log"), os.path.dirname("/var/log/nginx/access.log"))

def atomic_write(path, text):
    path = Path(path)
    fd, tmp = tempfile.mkstemp(dir=path.parent or ".", suffix=".tmp")
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        f.write(text)
    os.replace(tmp, path)

atomic_write("settings.ini", "[app]\\ndebug = false\\n")
print(Path("settings.ini").read_text(encoding="utf-8"), end="")

try:
    Path("no_such_folder/file.txt").read_text()
except FileNotFoundError as e:
    print("Handled:", type(e).__name__)

with tempfile.TemporaryDirectory() as tmp:
    Path(tmp, "scratch.txt").write_text("temp")
    inside = Path(tmp).exists()
print("Temp dir existed:", inside, "| exists now:", Path(tmp).exists())
Path("settings.ini").unlink()
`,
      python: {
        files: {
          "main.py": `import os
import tempfile
from pathlib import Path

print("Separator:", repr(os.sep))
print("Has CPUs :", (os.cpu_count() or 1) >= 1)
print("APP_ENV  :", os.environ.get("APP_ENV", "development"))
print(os.path.join("config", "app.ini"))
print(os.path.splitext("backup.tar.gz"))
print(os.path.basename("/var/log/nginx/access.log"), os.path.dirname("/var/log/nginx/access.log"))

def atomic_write(path, text):
    path = Path(path)
    fd, tmp = tempfile.mkstemp(dir=path.parent or ".", suffix=".tmp")
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        f.write(text)
    os.replace(tmp, path)

atomic_write("settings.ini", "[app]\\ndebug = false\\n")
print(Path("settings.ini").read_text(encoding="utf-8"), end="")

try:
    Path("no_such_folder/file.txt").read_text()
except FileNotFoundError as e:
    print("Handled:", type(e).__name__)

with tempfile.TemporaryDirectory() as tmp:
    Path(tmp, "scratch.txt").write_text("temp")
    inside = Path(tmp).exists()
print("Temp dir existed:", inside, "| exists now:", Path(tmp).exists())
Path("settings.ini").unlink()
`,
        },
      },
      result: `Separator: '/'
Has CPUs : True
APP_ENV  : development
config/app.ini
('backup.tar', '.gz')
access.log /var/log/nginx
[app]
debug = false
Handled: FileNotFoundError
Temp dir existed: True | exists now: False`,
      explanation: "os.environ.get reads environment variables with a default. os.path functions work with strings. atomic_write writes to a temporary file in the same folder and then os.replace swaps it in one step. TemporaryDirectory is deleted automatically when the with block ends.",
    },
  ],
  interview: [
    {
      q: "Why prefer pathlib over os.path?",
      a: "pathlib represents paths as objects with readable methods and the `/` join operator, works the same on Windows and Linux, and bundles common operations (read_text, glob, mkdir, exists, stat) in one place. os.path works with plain strings and spreads functionality across os, os.path, glob and shutil.",
      level: "Easy",
    },
    {
      q: "How do you create nested directories safely?",
      a: "`Path('a/b/c').mkdir(parents=True, exist_ok=True)` or `os.makedirs('a/b/c', exist_ok=True)`. parents creates missing parent folders; exist_ok avoids FileExistsError if it already exists.",
      level: "Easy",
    },
    {
      q: "Difference between Path.glob and Path.rglob?",
      a: "glob(pattern) matches within the given folder (unless the pattern contains `**`). rglob(pattern) searches recursively in all subdirectories; `rglob('*.py')` equals `glob('**/*.py')`.",
      level: "Easy",
    },
    {
      q: "How do you delete a non-empty directory?",
      a: "`shutil.rmtree(path)`. `os.rmdir` and `Path.rmdir` only remove empty folders. rmtree permanently deletes everything inside, so validate the path first.",
      level: "Easy",
    },
    {
      q: "Difference between shutil.copy, copy2 and copyfile?",
      a: "copyfile copies only the content (dst must be a file path). copy copies content and permission bits and accepts a directory as dst. copy2 is like copy but also tries to preserve metadata such as modification times.",
      level: "Medium",
    },
    {
      q: "What does os.walk return?",
      a: "A generator yielding a tuple `(dirpath, dirnames, filenames)` for each directory in the tree, top-down by default. Modifying `dirnames` in place (e.g. `dirnames[:] = [...]`) controls which subdirectories are visited.",
      level: "Medium",
    },
    {
      q: "Why should you specify encoding when reading/writing text files?",
      a: "Without it, Python uses the platform default encoding (often cp1252 on older Windows setups, UTF-8 on Linux), so the same script can produce UnicodeDecodeError or garbled characters (like ₹) on another machine. Passing encoding='utf-8' makes behaviour consistent. Python 3.15 plans to make UTF-8 the default.",
      level: "Medium",
    },
    {
      q: "How can you write a file atomically?",
      a: "Write the content to a temporary file in the same directory (tempfile.mkstemp or NamedTemporaryFile(delete=False)), flush/close it, then call `os.replace(tmp, target)`, which renames atomically on the same filesystem. Readers see either the old or the new file, never a partial one.",
      level: "Hard",
    },
    {
      q: "What is the difference between Path.rename and Path.replace?",
      a: "Both move/rename a file. On Windows, rename raises FileExistsError if the target exists, whereas replace overwrites it on all platforms. On POSIX, rename silently overwrites too, so use replace for consistent overwrite behaviour.",
      level: "Hard",
    },
    {
      q: "How do you get a file's size and last modified time?",
      a: "`st = Path(f).stat()`; `st.st_size` is size in bytes and `st.st_mtime` is the modification time as a Unix timestamp; convert with `datetime.fromtimestamp(st.st_mtime)`. os.path.getsize and getmtime also work.",
      level: "Easy",
    },
    {
      q: "What does `**` mean in a glob pattern?",
      a: "It matches zero or more directories recursively. With pathlib it works directly (`Path('.').glob('**/*.txt')`); with the glob module you also need `recursive=True`.",
      level: "Medium",
    },
    {
      q: "How would you find and delete log files older than 30 days?",
      a: "Compute a cutoff `time.time() - 30*86400`, iterate `Path('logs').rglob('*.log')`, and for each file with `stat().st_mtime < cutoff`, call `unlink()`. Log or dry-run first, and handle PermissionError.",
      level: "Medium",
    },
  ],
  practice: [
    {
      task: "Write a script that creates a folder `practice_out` with three files a.txt, b.txt, c.log containing different text, then prints only the .txt files with their sizes, and finally removes the folder.",
      hint: "Path.mkdir(exist_ok=True), write_text, glob('*.txt'), stat().st_size, shutil.rmtree.",
      solution: `from pathlib import Path
import shutil

out = Path("practice_out")
out.mkdir(exist_ok=True)
(out / "a.txt").write_text("hello")
(out / "b.txt").write_text("hello world")
(out / "c.log").write_text("log")
for f in sorted(out.glob("*.txt")):
    print(f.name, f.stat().st_size)
shutil.rmtree(out)
`,
    },
    {
      task: "Given a list of file names ['IMG_001.jpg', 'report.PDF', 'data.csv', 'archive.tar.gz', 'README'], print the stem and lower-case suffix of each using PurePath.",
      hint: "PurePath(name).stem and .suffix.lower(); README has an empty suffix.",
      solution: `from pathlib import PurePath

for name in ["IMG_001.jpg", "report.PDF", "data.csv", "archive.tar.gz", "README"]:
    p = PurePath(name)
    print(f"{name:<15} stem={p.stem:<12} suffix={p.suffix.lower() or '(none)'}")
`,
    },
    {
      task: "Write `count_lines(folder, pattern='*.py')` that returns the total number of lines in all matching files recursively. Test it on a small folder you create in the script.",
      hint: "sum(len(p.read_text().splitlines()) for p in Path(folder).rglob(pattern))",
      solution: `from pathlib import Path
import shutil

def count_lines(folder, pattern="*.py"):
    return sum(len(p.read_text(encoding="utf-8").splitlines()) for p in Path(folder).rglob(pattern))

base = Path("code_demo")
(base / "pkg").mkdir(parents=True, exist_ok=True)
(base / "main.py").write_text("import pkg\\nprint(1)\\n")
(base / "pkg" / "util.py").write_text("def f():\\n    return 1\\n\\n")
print(count_lines(base))
shutil.rmtree(base)
`,
    },
    {
      task: "Write a function `backup(folder)` that copies a folder to `<folder>_backup` and creates `<folder>.zip`. Demonstrate it on a demo folder and print the names of what was created, then clean up.",
      hint: "shutil.copytree(..., dirs_exist_ok=True) and shutil.make_archive(folder, 'zip', root_dir=folder)",
      solution: `from pathlib import Path
import shutil

def backup(folder):
    folder = Path(folder)
    copy_dir = shutil.copytree(folder, folder.with_name(folder.name + "_backup"), dirs_exist_ok=True)
    zip_file = shutil.make_archive(str(folder), "zip", root_dir=folder)
    return Path(copy_dir), Path(zip_file)

src = Path("site")
src.mkdir(exist_ok=True)
(src / "index.html").write_text("<h1>Hi</h1>")
copy_dir, zip_file = backup(src)
print(copy_dir.name, zip_file.name)
shutil.rmtree(src)
shutil.rmtree(copy_dir)
zip_file.unlink()
`,
    },
  ],
  quiz: [
    {
      question: "What does Path('docs') / 'guide' / 'intro.md' produce?",
      options: [
        "A string 'docs/guide/intro.md'",
        "A Path object for docs/guide/intro.md",
        "TypeError",
        "A list of parts",
      ],
      answer: 1,
      explanation: "The / operator on Path objects returns a new Path.",
    },
    {
      question: "Path('report.final.xlsx').stem is...",
      options: [
        "'report'",
        "'report.final'",
        "'xlsx'",
        "'.xlsx'",
      ],
      answer: 1,
      explanation: "stem removes only the last suffix.",
    },
    {
      question: "Which call deletes a folder that still has files in it?",
      options: [
        "os.rmdir(p)",
        "Path(p).rmdir()",
        "shutil.rmtree(p)",
        "os.remove(p)",
      ],
      answer: 2,
      explanation: "Only shutil.rmtree removes non-empty directory trees.",
    },
    {
      question: "Which finds all .csv files in a folder and all its subfolders?",
      options: [
        "Path('d').glob('*.csv')",
        "Path('d').rglob('*.csv')",
        "os.listdir('d')",
        "Path('d').iterdir()",
      ],
      answer: 1,
      explanation: "rglob searches recursively.",
    },
    {
      question: "What does mkdir(parents=True, exist_ok=True) prevent?",
      options: [
        "PermissionError",
        "Errors for missing parents and existing folder",
        "Overwriting files",
        "Creating hidden folders",
      ],
      answer: 1,
      explanation: "parents creates missing parent folders and exist_ok ignores an existing directory.",
    },
    {
      question: "os.path.splitext('photo.backup.png') returns...",
      options: [
        "('photo', '.backup.png')",
        "('photo.backup', '.png')",
        "['photo', 'backup', 'png']",
        "('photo.backup.png', '')",
      ],
      answer: 1,
      explanation: "splitext splits at the last dot.",
    },
  ],
};
