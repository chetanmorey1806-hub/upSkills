export default {
  lesson: 'extra-08-os-pathlib-shutil-glob',
  minutes: 30,
  intro: 'Automate files and folders with pathlib: build paths, read and write files, find files with glob and organise them with shutil.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What is printed? (PurePosixPath behaves like Path on Linux/macOS)',
      code: `from pathlib import PurePosixPath as P
p = P("reports") / "2025" / "sales.final.csv"
print(p)
print(p.name)
print(p.stem)
print(p.suffix)
print(p.parent.name)
print(p.with_suffix(".xlsx").name)`,
      expected: 'reports/2025/sales.final.csv\nsales.final.csv\nsales.final\n.csv\n2025\nsales.final.xlsx',
      explain: 'The `/` operator joins path parts. `name` is the last part, `suffix` is only the LAST extension and `stem` is the name without it. `parent` is the folder above. `with_suffix` replaces the extension.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which call finds `.py` files in a folder **and all its sub-folders**?',
      options: ['`Path("src").glob("*.py")`', '`Path("src").rglob("*.py")`', '`Path("src").iterdir()`', '`os.listdir("src")`'],
      answer: 1,
      explain: '`rglob(pattern)` is recursive, same as `glob("**/" + pattern)`. `glob("*.py")` and `iterdir()` look only at the direct children of the folder.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'You need to delete a folder that still contains files. Which works?',
      options: ['`Path("old").rmdir()`', '`os.remove("old")`', '`shutil.rmtree("old")`', '`Path("old").unlink()`'],
      answer: 2,
      explain: '`shutil.rmtree` deletes a whole directory tree. `rmdir()` only removes an EMPTY folder and `unlink()` / `os.remove()` remove files, not folders. rmtree is permanent, so double-check the path first.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Write `save_and_count(folder, files)` where `files` is a dict `{filename: text}`. Create `folder` (with parents, no error if it exists), write every file into it with `Path.write_text`, then return the sorted list of names of the `.txt` files in the folder (use `glob`).',
      example: { title: 'creating folders and files', code: 'from pathlib import Path\nout = Path("backup") / "2025"\nout.mkdir(parents=True, exist_ok=True)\n(out / "notes.txt").write_text("hello")\nprint([p.name for p in out.glob("*.txt")])' },
      starter: 'from pathlib import Path\n\ndef save_and_count(folder, files):\n    # TODO\n    return []\n',
      solution: 'from pathlib import Path\n\ndef save_and_count(folder, files):\n    base = Path(folder)\n    base.mkdir(parents=True, exist_ok=True)\n    for name, text in files.items():\n        (base / name).write_text(text)\n    return sorted(p.name for p in base.glob("*.txt"))\n',
      tests: [
        { call: '__import__("shutil").rmtree("t_extra08", ignore_errors=True) or save_and_count("t_extra08/a/b", {"x.txt": "1", "y.csv": "2", "z.txt": "3"})', expect: ['x.txt', 'z.txt'] },
        { call: 'save_and_count("t_extra08/a/b", {"w.txt": "4"})', expect: ['w.txt', 'x.txt', 'z.txt'], msg: 'Calling again on an existing folder must not fail' },
        { call: '__import__("pathlib").Path("t_extra08/a/b/y.csv").read_text()', expect: '2', msg: 'File contents must be written' },
      ],
      explain: '`mkdir(parents=True, exist_ok=True)` creates missing parent folders and does not fail if the folder already exists. `glob("*.txt")` returns Path objects, so take `.name` and sort the result because the order of glob is not guaranteed.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Organise a Downloads folder. Write `organise(folder)` that moves every file into a sub-folder named after its extension without the dot, in lower case (e.g. `report.PDF` → `pdf/report.PDF`). Files with no extension go to `other/`. Use `shutil.move`. Return a dict `{subfolder: number of files moved there}`.',
      example: { title: 'moving files', code: 'import shutil\nfrom pathlib import Path\ndest = Path("dl") / "images"\ndest.mkdir(exist_ok=True)\nshutil.move(str(Path("dl") / "cat.jpg"), str(dest / "cat.jpg"))' },
      starter: 'import shutil\nfrom pathlib import Path\n\ndef organise(folder):\n    counts = {}\n    # TODO\n    return counts\n',
      solution: 'import shutil\nfrom pathlib import Path\n\ndef organise(folder):\n    base = Path(folder)\n    counts = {}\n    for f in list(base.iterdir()):\n        if not f.is_file():\n            continue\n        sub = f.suffix[1:].lower() or "other"\n        (base / sub).mkdir(exist_ok=True)\n        shutil.move(str(f), str(base / sub / f.name))\n        counts[sub] = counts.get(sub, 0) + 1\n    return counts\n',
      tests: [
        { call: '__import__("shutil").rmtree("t_ex08dl", ignore_errors=True) or (lambda P: ([ (P("t_ex08dl")).mkdir(exist_ok=True) ] and [ (P("t_ex08dl") / n).write_text("x") for n in ["a.pdf", "b.PDF", "c.jpg", "README"] ]) and organise("t_ex08dl"))(__import__("pathlib").Path)', expect: { pdf: 2, jpg: 1, other: 1 } },
        { call: '(__import__("pathlib").Path("t_ex08dl/pdf/b.PDF").exists(), __import__("pathlib").Path("t_ex08dl/a.pdf").exists())', expect: [true, false], msg: 'Files must be moved (not copied) into the sub-folder' },
      ],
      explain: 'Loop over `iterdir()` and skip folders. `suffix` includes the dot, so slice it off and lower-case it. Wrap `iterdir()` in `list(...)` before moving files so you are not changing the folder while iterating it. `shutil.move` removes the original, unlike `shutil.copy`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `total_size(folder)` that returns the total size in bytes of all files in `folder` and its sub-folders (use `rglob("*")` and `stat().st_size`, skipping directories).',
      example: { title: 'file size', code: 'from pathlib import Path\np = Path("data.csv")\nprint(p.stat().st_size, "bytes")' },
      starter: 'from pathlib import Path\n\ndef total_size(folder):\n    # TODO\n    return 0\n',
      solution: 'from pathlib import Path\n\ndef total_size(folder):\n    return sum(p.stat().st_size for p in Path(folder).rglob("*") if p.is_file())\n',
      tests: [
        { call: '__import__("shutil").rmtree("t_ex08sz", ignore_errors=True) or (lambda P: (P("t_ex08sz/in").mkdir(parents=True, exist_ok=True), (P("t_ex08sz") / "a.txt").write_text("hello"), (P("t_ex08sz/in") / "b.txt").write_text("1234567890")) and total_size("t_ex08sz"))(__import__("pathlib").Path)', expect: 15 },
        { call: '(lambda P: P("t_ex08empty").mkdir(exist_ok=True) or total_size("t_ex08empty"))(__import__("pathlib").Path)', expect: 0 },
      ],
      explain: '`rglob("*")` walks every file and folder recursively. Folders also have a `st_size`, so filter with `is_file()`. 5 bytes ("hello") + 10 bytes = 15.',
    },
  ],
};
