export default {
  lesson: 'day-01-automating-files-and-folders',
  minutes: 35,
  intro: 'Automate files and folders with pathlib, os and shutil: list and search files, organise a Downloads folder by type, bulk-rename safely and report folder sizes.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What does this print? (pathlib does not need the file to exist for these)',
      code: `from pathlib import Path
p = Path("reports") / "2024" / "sales_march.xlsx"
print(p.name)
print(p.stem)
print(p.suffix)
print(p.parent.name)
print(p.with_suffix(".csv").name)`,
      expected: 'sales_march.xlsx\nsales_march\n.xlsx\n2024\nsales_march.csv',
      explain: 'The `/` operator joins path parts safely on Windows and Linux. `name` = file name, `stem` = name without extension, `suffix` = extension with the dot, `parent` = containing folder. `with_suffix` returns a new path – it does not rename anything on disk.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about file automation are TRUE? (choose all that apply)',
      options: ['`shutil.move(src, dst)` moves (or renames) a file', '`Path("data").mkdir(parents=True, exist_ok=True)` does not fail if the folder already exists', '`shutil.rmtree(folder)` sends the folder to the Recycle Bin', 'A "dry run" mode that only prints what would happen is a good safety practice', '`Path(".").glob("*.pdf")` finds PDF files in the current folder'],
      answers: [0, 1, 3, 4],
      explain: '`shutil.rmtree` and `os.remove` delete **permanently** – there is no Recycle Bin. That is why automation scripts should support a dry run, log every action and never overwrite files silently.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 10,
      q: '**Downloads organiser.** The starter creates a `downloads` folder with mixed files. Write `organize(folder)` that moves each file into a sub-folder by type and returns a dict `{category: number_of_files_moved}`:\n- `.jpg`, `.png` → `Images`\n- `.pdf`, `.docx`, `.xlsx` → `Documents`\n- `.zip` → `Archives`\n- anything else → `Others`\n\nCreate the sub-folders when needed. Compare extensions **case-insensitively** (`.PDF` is a document).',
      example: { title: 'moving files by extension', code: 'from pathlib import Path\nimport shutil\nfor f in Path("inbox").iterdir():\n    if f.is_file() and f.suffix.lower() == ".txt":\n        (Path("inbox") / "Text").mkdir(exist_ok=True)\n        shutil.move(str(f), str(Path("inbox") / "Text" / f.name))' },
      starter: `from pathlib import Path
import shutil

# sample data (do not change)
base = Path("downloads")
base.mkdir(exist_ok=True)
for name in ["photo1.jpg", "Scan.PDF", "invoice.pdf", "data.xlsx", "backup.zip", "notes.txt", "logo.png", "setup.exe"]:
    (base / name).write_text("x")

def organize(folder):
    # TODO
    pass
`,
      solution: `from pathlib import Path
import shutil

# sample data (do not change)
base = Path("downloads")
base.mkdir(exist_ok=True)
for name in ["photo1.jpg", "Scan.PDF", "invoice.pdf", "data.xlsx", "backup.zip", "notes.txt", "logo.png", "setup.exe"]:
    (base / name).write_text("x")

TYPES = {".jpg": "Images", ".png": "Images", ".pdf": "Documents", ".docx": "Documents",
         ".xlsx": "Documents", ".zip": "Archives"}

def organize(folder):
    folder = Path(folder)
    counts = {}
    for f in list(folder.iterdir()):
        if not f.is_file():
            continue
        cat = TYPES.get(f.suffix.lower(), "Others")
        (folder / cat).mkdir(exist_ok=True)
        shutil.move(str(f), str(folder / cat / f.name))
        counts[cat] = counts.get(cat, 0) + 1
    return counts
`,
      tests: [
        { call: 'organize("downloads")', expect: { Images: 2, Documents: 3, Archives: 1, Others: 2 } },
        { call: 'sorted(p.name for p in Path("downloads/Documents").iterdir())', expect: ['Scan.PDF', 'data.xlsx', 'invoice.pdf'] },
        { call: 'sorted(p.name for p in Path("downloads").iterdir() if p.is_file())', expect: [], msg: 'no loose files may remain in downloads' },
      ],
      explain: 'Collect the file list first (`list(folder.iterdir())`) because you are changing the folder while looping. `suffix.lower()` handles "Scan.PDF". A mapping dict keeps the rules in one place and makes adding a new type a one-line change.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: '**Bulk rename with dry run.** Write `bulk_rename(folder, prefix, dry_run=True)` that renames every `.jpg` file (sorted by name) to `<prefix>_001.jpg`, `<prefix>_002.jpg`, … and returns a list of `(old_name, new_name)` pairs. When `dry_run` is True it must **not** rename anything, only return the plan.',
      example: { title: 'numbered names', code: 'for i, f in enumerate(sorted(files), start=1):\n    new = f.with_name(f"trip_{i:03d}{f.suffix}")   # trip_001.jpg\n    f.rename(new)' },
      starter: `from pathlib import Path

photos = Path("photos")
photos.mkdir(exist_ok=True)
for name in ["IMG_2045.jpg", "IMG_1999.jpg", "readme.txt", "IMG_2101.jpg"]:
    (photos / name).write_text("x")

def bulk_rename(folder, prefix, dry_run=True):
    # TODO
    pass
`,
      solution: `from pathlib import Path

photos = Path("photos")
photos.mkdir(exist_ok=True)
for name in ["IMG_2045.jpg", "IMG_1999.jpg", "readme.txt", "IMG_2101.jpg"]:
    (photos / name).write_text("x")

def bulk_rename(folder, prefix, dry_run=True):
    plan = []
    files = sorted(p for p in Path(folder).iterdir() if p.is_file() and p.suffix.lower() == ".jpg")
    for i, f in enumerate(files, start=1):
        new = f.with_name(f"{prefix}_{i:03d}{f.suffix}")
        plan.append((f.name, new.name))
        if not dry_run:
            f.rename(new)
    return plan
`,
      tests: [
        { call: 'bulk_rename("photos", "goa")', expect: [['IMG_1999.jpg', 'goa_001.jpg'], ['IMG_2045.jpg', 'goa_002.jpg'], ['IMG_2101.jpg', 'goa_003.jpg']] },
        { call: 'sorted(p.name for p in Path("photos").iterdir())', expect: ['IMG_1999.jpg', 'IMG_2045.jpg', 'IMG_2101.jpg', 'readme.txt'], msg: 'dry run must not rename anything' },
        { call: '(bulk_rename("photos", "goa", dry_run=False), sorted(p.name for p in Path("photos").iterdir()))[1]', expect: ['goa_001.jpg', 'goa_002.jpg', 'goa_003.jpg', 'readme.txt'] },
      ],
      explain: '`{i:03d}` pads numbers to 3 digits so files sort correctly (001 … 010, not 1, 10, 2). Showing the plan first (dry run) and only then renaming protects you from wiping out hundreds of file names with one bug.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: '**Folder size report.** Write `size_report(folder)` that walks the folder **recursively** (`os.walk` or `Path.rglob`) and returns a dict `{extension: total_bytes}` (extension lower-case without the dot, e.g. `"csv"`; files without an extension use `"none"`).',
      example: { title: 'os.walk', code: 'import os\nfor root, dirs, files in os.walk("projects"):\n    for name in files:\n        full = os.path.join(root, name)\n        print(full, os.path.getsize(full))' },
      starter: `import os
from pathlib import Path

root = Path("office")
(root / "2024" / "march").mkdir(parents=True, exist_ok=True)
(root / "a.csv").write_text("x" * 100)
(root / "2024" / "b.CSV").write_text("x" * 50)
(root / "2024" / "march" / "c.txt").write_text("x" * 30)
(root / "2024" / "march" / "README").write_text("x" * 7)

def size_report(folder):
    # TODO
    pass
`,
      solution: `import os
from pathlib import Path

root = Path("office")
(root / "2024" / "march").mkdir(parents=True, exist_ok=True)
(root / "a.csv").write_text("x" * 100)
(root / "2024" / "b.CSV").write_text("x" * 50)
(root / "2024" / "march" / "c.txt").write_text("x" * 30)
(root / "2024" / "march" / "README").write_text("x" * 7)

def size_report(folder):
    totals = {}
    for dirpath, dirs, files in os.walk(folder):
        for name in files:
            full = os.path.join(dirpath, name)
            ext = os.path.splitext(name)[1].lower().lstrip(".") or "none"
            totals[ext] = totals.get(ext, 0) + os.path.getsize(full)
    return totals
`,
      tests: [
        { call: 'size_report("office")', expect: { csv: 150, txt: 30, none: 7 } },
      ],
      explain: '`os.walk` yields every folder with its file names, so nested folders are included automatically. Normalising the extension (lower case, no dot) groups "b.CSV" with "a.csv". This is the core of a disk-usage or "what is filling my drive" report.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Which `shutil` function **copies a file together with its metadata** (modification time, permissions)? `shutil.____(src, dst)`',
      accept: ['copy2'],
      explain: '`shutil.copy2` keeps metadata, `shutil.copy` copies content and permissions only, `shutil.copytree` copies a whole folder and `shutil.make_archive` creates a zip of a folder.',
    },
  ],
};
