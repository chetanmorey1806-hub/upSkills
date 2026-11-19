export default {
  lesson: 'day-26-csv-json',
  minutes: 35,
  intro: 'Read and write CSV with csv.reader / DictReader / DictWriter, convert data to and from JSON, and build small reports.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `import json
data = {"name": "Asha", "active": True, "score": None, "skills": ("py", "sql")}
text = json.dumps(data)
print(text)
back = json.loads(text)
print(back["active"], back["score"], back["skills"])`,
      expected: '{"name": "Asha", "active": true, "score": null, "skills": ["py", "sql"]}\nTrue None [\'py\', \'sql\']',
      explain: 'JSON uses `true/false/null` and double quotes; Python uses `True/False/None`. Tuples become JSON arrays, so they come back as **lists**. `dumps`/`loads` work with strings; `dump`/`load` work with files.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'On Windows, CSV files written with `csv.writer` show an **empty line between rows**. What is the fix?',
      options: ['Use mode "a"', 'Open the file with newline=""', 'Use json instead', 'Add "\\n" at the end of each row'],
      answer: 1,
      explain: 'The csv module writes its own line endings (`\\r\\n`). Without `newline=""`, Windows translates them again, producing blank lines. Always open CSV files with `open(path, "w", newline="")`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `write_marks(path, rows)` that writes a CSV with header `name,marks` followed by the `(name, marks)` tuples in `rows`, and `average_marks(path)` that reads it back with `csv.DictReader` and returns the average marks rounded to 2.',
      example: { title: 'csv.writer and DictReader', code: 'import csv\nwith open("a.csv", "w", newline="") as f:\n    w = csv.writer(f)\n    w.writerow(["city", "temp"])\n    w.writerows([["Pune", 31]])\n\nwith open("a.csv", newline="") as f:\n    for row in csv.DictReader(f):\n        print(row["city"], int(row["temp"]))' },
      starter: `import csv

def write_marks(path, rows):
    # TODO
    pass

def average_marks(path):
    # TODO
    pass
`,
      solution: `import csv

def write_marks(path, rows):
    with open(path, "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["name", "marks"])
        w.writerows(rows)

def average_marks(path):
    with open(path, newline="") as f:
        marks = [int(r["marks"]) for r in csv.DictReader(f)]
    return round(sum(marks) / len(marks), 2)
`,
      tests: [
        { call: 'write_marks("marks.csv", [("Asha", 91), ("Ravi", 78), ("Neha", 85)])', expect: null },
        { call: 'open("marks.csv").read().splitlines()', expect: ['name,marks', 'Asha,91', 'Ravi,78', 'Neha,85'] },
        { call: 'average_marks("marks.csv")', expect: 84.67 },
      ],
      explain: 'Every value read from a CSV is a **string**: convert with `int()` before doing maths ("91" + "78" would concatenate). DictReader uses the header row as keys, so you can write `row["marks"]` instead of `row[1]`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Sales report. Write `sales_by_city(csv_text)` that takes CSV **text** (not a file) with columns `city,amount` and returns a dict city → total amount (ints).\n\nTip: `csv.DictReader` accepts any iterable of lines, e.g. `csv_text.splitlines()` or `io.StringIO(csv_text)`.',
      example: { title: 'CSV from a string', code: 'import csv, io\ntext = "a,b\\n1,2\\n"\nfor row in csv.DictReader(io.StringIO(text)):\n    print(row)   # {\'a\': \'1\', \'b\': \'2\'}' },
      starter: `import csv

def sales_by_city(csv_text):
    totals = {}
    # TODO
    return totals
`,
      solution: `import csv

def sales_by_city(csv_text):
    totals = {}
    for row in csv.DictReader(csv_text.splitlines()):
        totals[row["city"]] = totals.get(row["city"], 0) + int(row["amount"])
    return totals
`,
      tests: [
        { call: 'sales_by_city("city,amount\\nPune,500\\nDelhi,300\\nPune,250\\n")', expect: { Pune: 750, Delhi: 300 } },
        { call: 'sales_by_city("city,amount\\n")', expect: {} },
      ],
      explain: 'DictReader turns each line into a dict keyed by the header. Accumulate with `dict.get(key, 0) + value`. Splitting lines by commas yourself breaks on quoted values like `"Navi Mumbai, MH"`: the csv module handles those.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'CSV → JSON converter. Write `csv_to_json(csv_text)` that returns a **JSON string** (a list of objects, one per row) where the `age` column is converted to int. Use `json.dumps`.\n\n`csv_to_json("name,age\\nAsha,21\\nRavi,23\\n")` → `\'[{"name": "Asha", "age": 21}, {"name": "Ravi", "age": 23}]\'`',
      example: { title: 'json.dumps', code: 'import json\nprint(json.dumps([{"id": 1, "ok": True}]))   # [{"id": 1, "ok": true}]' },
      starter: `import csv, json

def csv_to_json(csv_text):
    # TODO
    pass
`,
      solution: `import csv, json

def csv_to_json(csv_text):
    rows = []
    for row in csv.DictReader(csv_text.splitlines()):
        row["age"] = int(row["age"])
        rows.append(row)
    return json.dumps(rows)
`,
      tests: [
        { call: '__import__("json").loads(csv_to_json("name,age\\nAsha,21\\nRavi,23\\n"))', expect: [{ name: 'Asha', age: 21 }, { name: 'Ravi', age: 23 }] },
        { call: 'type(csv_to_json("name,age\\nAsha,21\\n")).__name__', expect: 'str', msg: 'return a JSON string (json.dumps), not a Python list' },
      ],
      explain: '`json.dumps` turns Python lists/dicts into JSON text. Without converting `age`, the JSON would contain `"21"` (a string) instead of the number 21: APIs and front-ends often reject that.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the line that saves the dict `config` to an open file `f` as nicely indented JSON:\n```\njson.____(config, f, indent=2)\n```',
      accept: ['dump'],
      explain: '`json.dump(obj, file)` writes to a file; `json.dumps(obj)` returns a string. Remember: the "s" means **string**. `indent=2` makes it human-readable.',
    },
  ],
};
