export default {
  id: "day-01-automating-files-and-folders",
  title: "Automating Files and Folders: os, shutil and pathlib",
  module: "Module 1: Files & Office Automation",
  day: 1,
  level: "Beginner",
  duration: "2.5 hours",
  summary: "Learn how Python can create, find, copy, move, rename and delete files and folders automatically. You will build real scripts like a Downloads folder organizer and a bulk file renamer using pathlib, os and shutil.",
  objectives: [
    "Work with file paths safely on Windows, Linux and macOS using pathlib",
    "List, filter and search files with iterdir(), glob() and rglob()",
    "Copy, move, rename and delete files and folders with shutil and pathlib",
    "Build a Downloads folder organizer that sorts files by extension",
    "Bulk rename files safely with a dry-run mode",
  ],
  theory: [
    {
      heading: "Why Automate Files and Folders?",
      content: "Every office has boring file work: sorting hundreds of downloads, renaming invoice scans, moving old reports into an archive, cleaning temporary files. A person may take an hour; a 20-line Python script does it in one second, every day, without mistakes.\n\nPython gives you three main tools for this job: `pathlib` (modern, object-oriented paths), `os` (older, low-level operating system functions) and `shutil` (high-level copy, move and delete of whole folders). All three are part of the standard library, so you do not need pip install.",
      points: [
        "pathlib: build paths, read names/extensions, list folders, create/rename/delete single files",
        "os: environment variables, current directory, os.walk() for walking a folder tree",
        "shutil: copy files with metadata, copy or delete whole folder trees, move across drives, make zip archives",
      ],
    },
    {
      heading: "pathlib Basics: Path Objects",
      content: "A `Path` object represents a file or folder location. You join parts with the `/` operator, which works on every operating system, so you never need to worry about `\\` vs `/`. A Path does not mean the file exists; it is only an address. Use `.exists()`, `.is_file()` and `.is_dir()` to check.",
      syntax: `from pathlib import Path

home = Path.home()                    # C:\\Users\\Asha or /home/asha
downloads = home / "Downloads"        # join with /
report = Path("reports/sales_2025.xlsx")

report.name       # 'sales_2025.xlsx'
report.stem       # 'sales_2025'
report.suffix     # '.xlsx'
report.parent     # Path('reports')
report.exists()   # True / False
Path.cwd()        # current working directory
`,
      tip: "Prefer pathlib for new code. Most libraries (pandas, openpyxl, shutil) accept Path objects directly.",
    },
    {
      heading: "Listing and Searching Files",
      content: "`iterdir()` gives every item directly inside a folder. `glob(\"*.pdf\")` matches a pattern in that folder only, and `rglob(\"*.pdf\")` searches all sub-folders recursively. The older `os.listdir()` returns plain strings and `os.walk()` walks a full tree giving (folder, sub_folders, files) for each level.",
      syntax: `folder = Path("Downloads")
for item in folder.iterdir():
    print(item.name, item.is_file())

pdfs = list(folder.glob("*.pdf"))          # only this folder
all_xlsx = list(folder.rglob("*.xlsx"))    # including sub-folders

import os
for root, dirs, files in os.walk("Downloads"):
    print(root, len(files))
`,
      points: [
        "The order returned by iterdir() and glob() is not guaranteed; wrap with sorted() for stable output",
        "Use item.stat().st_size for size in bytes and item.stat().st_mtime for last-modified time",
      ],
    },
    {
      heading: "Creating, Copying, Moving and Deleting",
      content: "To create a folder use `mkdir(parents=True, exist_ok=True)` so it does not fail if parent folders are missing or the folder already exists. Write small text files with `write_text()`. For copying, `shutil.copy2()` copies a file with its timestamps, and `shutil.copytree()` copies a full folder. `shutil.move()` moves a file or folder, even across drives. Delete a file with `Path.unlink()`, an empty folder with `Path.rmdir()`, and a full folder tree with `shutil.rmtree()`.",
      syntax: `import shutil
from pathlib import Path

Path("archive/2025").mkdir(parents=True, exist_ok=True)
shutil.copy2("report.xlsx", "archive/2025/report.xlsx")
shutil.move("invoice.pdf", "archive/2025/")
Path("old.txt").unlink(missing_ok=True)
shutil.rmtree("temp_folder")      # deletes everything inside, no recycle bin!
shutil.make_archive("backup", "zip", "archive")  # creates backup.zip
`,
      tip: "shutil.rmtree() and unlink() delete permanently, they do not go to the Recycle Bin. Always test with print statements (dry run) first.",
    },
    {
      heading: "Renaming Files and Handling Name Conflicts",
      content: "`Path.rename(new_path)` renames or moves a file. On Windows, rename fails if the target already exists; `Path.replace()` overwrites silently on all systems. A safe automation script checks `target.exists()` first and adds a counter like `photo (1).jpg` to avoid overwriting data.\n\nFor bulk renames, build the new name from parts: `path.with_name(...)`, `path.with_stem(...)` (Python 3.9+) or `path.with_suffix(...)`.",
      syntax: `p = Path("IMG_0042.JPG")
p.with_suffix(".jpg")        # Path('IMG_0042.jpg')
p.with_stem("trip_042")      # Path('trip_042.JPG')
p.rename(p.with_name("trip_042.jpg"))
`,
    },
    {
      heading: "Writing Safe Automation Scripts",
      content: "File scripts can destroy data quickly, so professionals follow a few rules. Always have a dry-run mode that only prints what would happen. Never hardcode a dangerous path like `C:\\` or `/`. Skip hidden and system files. Log every action. Handle errors such as `PermissionError` (file open in Excel) and `FileNotFoundError` with try/except so one bad file does not stop the whole run.",
      points: [
        "Dry run first: print(\"Would move\", src, \"->\", dst)",
        "Work on a copy of the folder while testing",
        "Use try/except PermissionError for files locked by another program",
        "Keep the script idempotent: running it twice should not break anything",
      ],
      tip: "Interview answer: \"I always add a --dry-run flag and logging before running any file automation in production.\"",
    },
  ],
  examples: [
    {
      title: "Explore a Folder with pathlib",
      scenario: "Before automating anything, you want to see what files exist, their extensions and sizes. The script first creates a few sample files so it runs anywhere.",
      steps: [
        "No pip install needed: pathlib is part of the standard library",
        "Create main.py and paste the code",
        "Run: python main.py",
        "Change the sample names and run again to see how stem and suffix change",
      ],
      code: `from pathlib import Path

folder = Path("demo_downloads")
folder.mkdir(exist_ok=True)
for name in ["invoice_jan.pdf", "photo.JPG", "sales.xlsx", "notes.txt"]:
    (folder / name).write_text("sample data for " + name)

for item in sorted(folder.iterdir()):
    size = item.stat().st_size
    print(f"{item.name:<16} stem={item.stem:<12} ext={item.suffix.lower():<6} {size} bytes")

print("PDF files:", [p.name for p in folder.glob("*.pdf")])
`,
      result: `invoice_jan.pdf  stem=invoice_jan  ext=.pdf   31 bytes
notes.txt        stem=notes        ext=.txt   25 bytes
photo.JPG        stem=photo        ext=.jpg   25 bytes
sales.xlsx       stem=sales        ext=.xlsx  26 bytes
PDF files: ['invoice_jan.pdf']`,
      explanation: "mkdir(exist_ok=True) creates the folder only if needed. write_text() creates small sample files. sorted() makes the listing order stable. .stem is the name without extension, .suffix is the extension, and .lower() normalises '.JPG' to '.jpg' so later rules work for both cases. glob('*.pdf') filters by pattern.",
      python: {
        files: {
          "main.py": `from pathlib import Path

folder = Path("demo_downloads")
folder.mkdir(exist_ok=True)
for name in ["invoice_jan.pdf", "photo.JPG", "sales.xlsx", "notes.txt"]:
    (folder / name).write_text("sample data for " + name)

for item in sorted(folder.iterdir()):
    size = item.stat().st_size
    print(f"{item.name:<16} stem={item.stem:<12} ext={item.suffix.lower():<6} {size} bytes")

print("PDF files:", [p.name for p in folder.glob("*.pdf")])
`,
        },
      },
    },
    {
      title: "Downloads Folder Organizer",
      scenario: "Your Downloads folder is full of PDFs, images, spreadsheets and zip files. Write a script that moves each file into a category folder (Documents, Images, Spreadsheets, Archives, Others).",
      steps: [
        "No pip install needed (pathlib + shutil)",
        "Create main.py and paste the code; it creates sample files first",
        "Run: python main.py",
        "For real use, change folder to Path.home() / \"Downloads\" and set DRY_RUN = True for the first run",
      ],
      code: `from pathlib import Path
import shutil

CATEGORIES = {
    "Documents": {".pdf", ".docx", ".txt"},
    "Images": {".jpg", ".jpeg", ".png"},
    "Spreadsheets": {".xlsx", ".csv"},
    "Archives": {".zip", ".rar"},
}
DRY_RUN = False

def category_for(ext):
    for name, exts in CATEGORIES.items():
        if ext in exts:
            return name
    return "Others"

folder = Path("Downloads_demo")
folder.mkdir(exist_ok=True)
for f in ["resume.pdf", "trip.JPG", "sales.csv", "setup.zip", "song.mp3", "offer.docx"]:
    (folder / f).write_text("x")

moved = {}
for item in sorted(folder.iterdir()):
    if not item.is_file():
        continue
    cat = category_for(item.suffix.lower())
    target_dir = folder / cat
    if DRY_RUN:
        print("Would move", item.name, "->", cat)
        continue
    target_dir.mkdir(exist_ok=True)
    shutil.move(str(item), str(target_dir / item.name))
    moved[cat] = moved.get(cat, 0) + 1

for cat in sorted(moved):
    files = sorted(p.name for p in (folder / cat).iterdir())
    print(f"{cat}: {files}")
`,
      result: `Archives: ['setup.zip']
Documents: ['offer.docx', 'resume.pdf']
Images: ['trip.JPG']
Others: ['song.mp3']
Spreadsheets: ['sales.csv']`,
      explanation: "A dictionary maps each category to a set of extensions (set lookup is fast). category_for() returns the first matching category or 'Others'. We skip folders with is_file(), create the target folder only when needed and move with shutil.move(). Setting DRY_RUN = True prints the plan without touching any file, which is how you should test on your real Downloads folder.",
      python: {
        files: {
          "main.py": `from pathlib import Path
import shutil

CATEGORIES = {
    "Documents": {".pdf", ".docx", ".txt"},
    "Images": {".jpg", ".jpeg", ".png"},
    "Spreadsheets": {".xlsx", ".csv"},
    "Archives": {".zip", ".rar"},
}
DRY_RUN = False

def category_for(ext):
    for name, exts in CATEGORIES.items():
        if ext in exts:
            return name
    return "Others"

folder = Path("Downloads_demo")
folder.mkdir(exist_ok=True)
for f in ["resume.pdf", "trip.JPG", "sales.csv", "setup.zip", "song.mp3", "offer.docx"]:
    (folder / f).write_text("x")

moved = {}
for item in sorted(folder.iterdir()):
    if not item.is_file():
        continue
    cat = category_for(item.suffix.lower())
    target_dir = folder / cat
    if DRY_RUN:
        print("Would move", item.name, "->", cat)
        continue
    target_dir.mkdir(exist_ok=True)
    shutil.move(str(item), str(target_dir / item.name))
    moved[cat] = moved.get(cat, 0) + 1

for cat in sorted(moved):
    files = sorted(p.name for p in (folder / cat).iterdir())
    print(f"{cat}: {files}")
`,
        },
      },
    },
    {
      title: "Bulk Rename with Dry Run",
      scenario: "A photographer has files like IMG_001.JPG, IMG_002.JPG. The client wants them renamed to goa_trip_01.jpg, goa_trip_02.jpg with lowercase extensions.",
      steps: [
        "No pip install needed",
        "Run once with DRY_RUN = True to preview the new names",
        "Set DRY_RUN = False and run again to actually rename",
      ],
      code: `from pathlib import Path

folder = Path("photos")
folder.mkdir(exist_ok=True)
for i in [3, 1, 2]:
    (folder / f"IMG_00{i}.JPG").write_text("img")

def bulk_rename(folder, prefix, dry_run=True):
    files = sorted(folder.glob("IMG_*.JPG"))
    for n, old in enumerate(files, start=1):
        new = old.with_name(f"{prefix}_{n:02d}{old.suffix.lower()}")
        if new.exists():
            print("SKIP (exists):", new.name)
            continue
        print(("[dry run] " if dry_run else "") + f"{old.name} -> {new.name}")
        if not dry_run:
            old.rename(new)

bulk_rename(folder, "goa_trip", dry_run=True)
bulk_rename(folder, "goa_trip", dry_run=False)
print(sorted(p.name for p in folder.iterdir()))
`,
      result: `[dry run] IMG_001.JPG -> goa_trip_01.jpg
[dry run] IMG_002.JPG -> goa_trip_02.jpg
[dry run] IMG_003.JPG -> goa_trip_03.jpg
IMG_001.JPG -> goa_trip_01.jpg
IMG_002.JPG -> goa_trip_02.jpg
IMG_003.JPG -> goa_trip_03.jpg
['goa_trip_01.jpg', 'goa_trip_02.jpg', 'goa_trip_03.jpg']`,
      explanation: "sorted() makes numbering follow the original order. enumerate(start=1) gives the counter and {n:02d} pads it to two digits (01, 02). with_name() builds the new path in the same folder. The exists() check prevents overwriting, and the dry_run flag lets you preview before touching files.",
      python: {
        files: {
          "main.py": `from pathlib import Path

folder = Path("photos")
folder.mkdir(exist_ok=True)
for i in [3, 1, 2]:
    (folder / f"IMG_00{i}.JPG").write_text("img")

def bulk_rename(folder, prefix, dry_run=True):
    files = sorted(folder.glob("IMG_*.JPG"))
    for n, old in enumerate(files, start=1):
        new = old.with_name(f"{prefix}_{n:02d}{old.suffix.lower()}")
        if new.exists():
            print("SKIP (exists):", new.name)
            continue
        print(("[dry run] " if dry_run else "") + f"{old.name} -> {new.name}")
        if not dry_run:
            old.rename(new)

bulk_rename(folder, "goa_trip", dry_run=True)
bulk_rename(folder, "goa_trip", dry_run=False)
print(sorted(p.name for p in folder.iterdir()))
`,
        },
      },
    },
    {
      title: "Folder Size Report with os.walk",
      scenario: "IT wants to know which project folder uses the most disk space. Walk through every sub-folder, add up file sizes and print a report.",
      steps: [
        "No pip install needed",
        "Run: python main.py",
        "Replace 'projects' with any real folder path to analyse your disk",
      ],
      code: `import os
from pathlib import Path

base = Path("projects")
samples = {"alpha/data.csv": 1200, "alpha/src/app.py": 300, "beta/report.pdf": 5000, "beta/img/logo.png": 800}
for rel, size in samples.items():
    p = base / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_bytes(b"0" * size)

totals = {}
for root, dirs, files in os.walk(base):
    top = Path(root).relative_to(base).parts[:1]
    if not top:
        continue
    total = sum((Path(root) / f).stat().st_size for f in files)
    totals[top[0]] = totals.get(top[0], 0) + total

for name, size in sorted(totals.items(), key=lambda kv: kv[1], reverse=True):
    print(f"{name:<6} {size / 1024:6.2f} KB")
`,
      result: `beta     5.66 KB
alpha    1.46 KB`,
      explanation: "os.walk() visits every folder and returns its path, sub-folders and file names. relative_to(base).parts[:1] gives the top-level project name for any nested folder. We sum st_size of each file into a dictionary, then sort by size in descending order. Dividing by 1024 converts bytes to KB.",
      python: {
        files: {
          "main.py": `import os
from pathlib import Path

base = Path("projects")
samples = {"alpha/data.csv": 1200, "alpha/src/app.py": 300, "beta/report.pdf": 5000, "beta/img/logo.png": 800}
for rel, size in samples.items():
    p = base / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_bytes(b"0" * size)

totals = {}
for root, dirs, files in os.walk(base):
    top = Path(root).relative_to(base).parts[:1]
    if not top:
        continue
    total = sum((Path(root) / f).stat().st_size for f in files)
    totals[top[0]] = totals.get(top[0], 0) + total

for name, size in sorted(totals.items(), key=lambda kv: kv[1], reverse=True):
    print(f"{name:<6} {size / 1024:6.2f} KB")
`,
        },
      },
    },
    {
      title: "Archive Old Reports into a Zip",
      scenario: "Each month, copy all .csv reports into a dated archive folder, zip it, and remove the temporary copy.",
      steps: [
        "No pip install needed (shutil.make_archive is built in)",
        "Run: python main.py",
        "Open the created monthly_backup.zip to check its contents",
      ],
      code: `import shutil
import zipfile
from pathlib import Path

reports = Path("reports")
reports.mkdir(exist_ok=True)
for name in ["north.csv", "south.csv", "summary.txt"]:
    (reports / name).write_text("region,amount\\n")

staging = Path("archive_2025_11")
staging.mkdir(exist_ok=True)
for csv_file in sorted(reports.glob("*.csv")):
    shutil.copy2(csv_file, staging / csv_file.name)
    print("Copied", csv_file.name)

zip_path = shutil.make_archive("monthly_backup", "zip", root_dir=staging)
shutil.rmtree(staging)

with zipfile.ZipFile(zip_path) as z:
    print("Zip contains:", sorted(z.namelist()))
print("Staging removed:", not staging.exists())
`,
      result: `Copied north.csv
Copied south.csv
Zip contains: ['north.csv', 'south.csv']
Staging removed: True`,
      explanation: "copy2() copies files together with their modified time. make_archive(base_name, format, root_dir) zips the folder and returns the path of the zip file. rmtree() removes the temporary staging folder. Finally zipfile.ZipFile reads the archive to verify that only the CSV files were included.",
      python: {
        files: {
          "main.py": `import shutil
import zipfile
from pathlib import Path

reports = Path("reports")
reports.mkdir(exist_ok=True)
for name in ["north.csv", "south.csv", "summary.txt"]:
    (reports / name).write_text("region,amount\\n")

staging = Path("archive_2025_11")
staging.mkdir(exist_ok=True)
for csv_file in sorted(reports.glob("*.csv")):
    shutil.copy2(csv_file, staging / csv_file.name)
    print("Copied", csv_file.name)

zip_path = shutil.make_archive("monthly_backup", "zip", root_dir=staging)
shutil.rmtree(staging)

with zipfile.ZipFile(zip_path) as z:
    print("Zip contains:", sorted(z.namelist()))
print("Staging removed:", not staging.exists())
`,
        },
      },
    },
  ],
  interview: [
    { q: "What is the difference between os.path and pathlib?", a: "`os.path` works with paths as plain strings using functions like `os.path.join()` and `os.path.splitext()`. `pathlib` (Python 3.4+) uses `Path` objects with methods and properties: `p / \"file.txt\"`, `p.suffix`, `p.exists()`. pathlib is more readable, cross-platform and is the recommended choice for new code.", level: "Easy" },
    { q: "How do you list all .pdf files in a folder and its sub-folders?", a: "Use `Path(folder).rglob(\"*.pdf\")`. `glob()` only checks the given folder, `rglob()` is recursive. Alternatively use `os.walk()` and check `name.endswith(\".pdf\")`.", level: "Easy" },
    { q: "What is the difference between shutil.copy, shutil.copy2 and shutil.copytree?", a: "`copy()` copies file content and permission bits. `copy2()` also tries to preserve metadata such as last-modified time. `copytree()` copies a whole folder recursively (use `dirs_exist_ok=True` to copy into an existing folder).", level: "Medium" },
    { q: "How do you delete a folder that is not empty?", a: "`Path.rmdir()` and `os.rmdir()` only delete empty folders. For a non-empty folder use `shutil.rmtree(path)`. It deletes permanently, so it should be guarded with checks and a dry-run mode.", level: "Easy" },
    { q: "Path.rename() vs Path.replace() vs shutil.move()?", a: "`rename()` renames/moves within the same file system; on Windows it raises `FileExistsError` if the target exists. `replace()` overwrites the target on all platforms. `shutil.move()` works across drives/file systems by copying and then deleting the source.", level: "Medium" },
    { q: "Why does mkdir sometimes fail, and how do you avoid it?", a: "It raises `FileExistsError` if the folder exists and `FileNotFoundError` if parent folders are missing. Use `Path(p).mkdir(parents=True, exist_ok=True)`.", level: "Easy" },
    { q: "How would you make a file-organizer script safe to run on a real user folder?", a: "Add a dry-run mode, test on a copy, skip hidden/system files, check for name conflicts before moving, wrap each file operation in try/except (PermissionError, FileNotFoundError), log every action to a file, and make it idempotent so a second run does nothing harmful.", level: "Medium" },
    { q: "How do you get the file size and last-modified date of a file?", a: "`st = Path(p).stat()` then `st.st_size` (bytes) and `st.st_mtime` (Unix timestamp). Convert with `datetime.fromtimestamp(st.st_mtime)`.", level: "Easy" },
    { q: "How would you find and delete files older than 30 days?", a: "Compute `cutoff = time.time() - 30 * 86400`, loop with `rglob(\"*\")`, and for each file with `p.stat().st_mtime < cutoff` call `p.unlink()`. Log the names and run in dry-run mode first.", level: "Medium" },
    { q: "How can you detect duplicate files in a folder?", a: "Group files by size first (cheap), then for files with the same size compute a hash using `hashlib.sha256()` reading the file in chunks. Files with the same hash are duplicates. This avoids comparing every pair byte by byte.", level: "Hard" },
    { q: "Why should you use sorted() when listing files in automation scripts?", a: "`iterdir()`, `glob()` and `os.listdir()` return items in an arbitrary order that depends on the operating system and file system. sorted() makes the output predictable, which matters for numbering in bulk renames and for reproducible logs and tests.", level: "Medium" },
    { q: "How do you handle a file that is open in Excel while your script tries to move it?", a: "On Windows the move raises `PermissionError`. Catch it with try/except, log a warning, skip the file and continue with the next. Optionally retry later or report the list of skipped files at the end.", level: "Hard" },
  ],
  practice: [
    {
      task: "Create a folder 'practice' with files a.txt, b.TXT, c.pdf, d.png. Print how many files exist for each extension (lowercase).",
      hint: "Use a dictionary or collections.Counter on p.suffix.lower().",
      solution: `from pathlib import Path
from collections import Counter

folder = Path("practice")
folder.mkdir(exist_ok=True)
for n in ["a.txt", "b.TXT", "c.pdf", "d.png"]:
    (folder / n).write_text("x")

counts = Counter(p.suffix.lower() for p in folder.iterdir() if p.is_file())
for ext, n in sorted(counts.items()):
    print(ext, n)
# .pdf 1
# .png 1
# .txt 2
`,
    },
    {
      task: "Write a function add_prefix(folder, prefix) that renames every .txt file to prefix + original name, but skips files that already start with the prefix.",
      hint: "Use p.name.startswith(prefix) and p.with_name(prefix + p.name).",
      solution: `from pathlib import Path

def add_prefix(folder, prefix):
    for p in sorted(Path(folder).glob("*.txt")):
        if p.name.startswith(prefix):
            continue
        p.rename(p.with_name(prefix + p.name))
        print("Renamed", p.name)

add_prefix("practice", "2025_")
`,
    },
    {
      task: "Write a script that finds all files larger than 1 MB inside a folder (recursively) and prints their path and size in MB.",
      hint: "rglob('*'), check is_file() and stat().st_size > 1024 * 1024.",
      solution: `from pathlib import Path

LIMIT = 1024 * 1024
for p in Path(".").rglob("*"):
    if p.is_file() and p.stat().st_size > LIMIT:
        print(f"{p}  {p.stat().st_size / LIMIT:.2f} MB")
`,
    },
    {
      task: "Organise files into folders by modified year and month, e.g. 2025/11/report.pdf.",
      hint: "datetime.fromtimestamp(p.stat().st_mtime) gives a datetime; use .year and .month.",
      solution: `from pathlib import Path
from datetime import datetime
import shutil

src = Path("to_sort")
for p in sorted(src.iterdir()):
    if not p.is_file():
        continue
    dt = datetime.fromtimestamp(p.stat().st_mtime)
    target = src / str(dt.year) / f"{dt.month:02d}"
    target.mkdir(parents=True, exist_ok=True)
    shutil.move(str(p), str(target / p.name))
    print(p.name, "->", target)
`,
    },
    {
      task: "Write a duplicate finder: print groups of files in a folder that have identical content.",
      hint: "Hash file bytes with hashlib.sha256 and group paths by hash in a dict of lists.",
      solution: `import hashlib
from pathlib import Path

def file_hash(p):
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()

groups = {}
for p in Path("practice").rglob("*"):
    if p.is_file():
        groups.setdefault(file_hash(p), []).append(p.name)

for digest, names in groups.items():
    if len(names) > 1:
        print("Duplicates:", sorted(names))
`,
    },
  ],
  quiz: [
    { question: "Which expression correctly joins a folder and file name with pathlib?", options: ["Path('data') + 'sales.csv'", "Path('data') / 'sales.csv'", "Path('data').join('sales.csv')", "Path('data', '/sales.csv')"], answer: 1, explanation: "pathlib overloads the / operator to join path parts in an OS-independent way." },
    { question: "What does Path('report.final.xlsx').suffix return?", options: ["'.final.xlsx'", "'xlsx'", "'.xlsx'", "'report.final'"], answer: 2, explanation: "suffix returns only the last extension including the dot. Use .suffixes for all of them." },
    { question: "Which function deletes a folder that still contains files?", options: ["os.rmdir()", "Path.rmdir()", "Path.unlink()", "shutil.rmtree()"], answer: 3, explanation: "rmdir() works only on empty folders; unlink() deletes files. shutil.rmtree() removes a whole tree." },
    { question: "What does mkdir(parents=True, exist_ok=True) do?", options: ["Creates missing parent folders and does not fail if the folder already exists", "Deletes the folder first and recreates it", "Creates the folder only in the home directory", "Raises an error if the parent is missing"], answer: 0, explanation: "parents=True creates intermediate folders and exist_ok=True suppresses FileExistsError." },
    { question: "Which method searches sub-folders recursively?", options: ["glob('*.csv')", "iterdir()", "rglob('*.csv')", "os.listdir()"], answer: 2, explanation: "rglob() is recursive glob; glob() and iterdir() look only at one level." },
    { question: "What is the main purpose of a dry-run mode in a file automation script?", options: ["To run faster", "To preview actions without changing any files", "To delete temporary files", "To run without Python installed"], answer: 1, explanation: "A dry run prints what would happen so you can verify the plan before modifying real files." },
  ],
};
