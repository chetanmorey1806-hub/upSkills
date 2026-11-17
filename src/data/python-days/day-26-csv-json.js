export default {
  id: "day-26-csv-json",
  title: "Working with CSV and JSON Files",
  module: "Module 4: Exceptions & Files",
  day: 26,
  level: "Intermediate",
  duration: "2.5 hours",
  summary: "Read and write tabular data with the csv module (reader, writer, DictReader, DictWriter) and structured data with the json module (load, dump, loads, dumps), and convert between the two formats.",
  objectives: [
    "Read and write CSV files using csv.reader and csv.writer",
    "Use DictReader and DictWriter to work with columns by name",
    "Serialize Python objects to JSON and parse JSON back (dump/dumps, load/loads)",
    "Know the Python-to-JSON type mapping and common pitfalls",
    "Convert CSV to JSON and build small data-processing reports",
  ],
  theory: [
    {
      heading: "What are CSV and JSON?",
      content: "CSV (Comma-Separated Values) stores table data as plain text - each line is a row and commas separate columns. Excel, Google Sheets and databases can export CSV. JSON (JavaScript Object Notation) stores structured, nested data (objects and arrays) and is the standard format for web APIs and config files. Analogy: CSV is a simple register with rows and columns; JSON is a filing cabinet with folders inside folders.",
      syntax: `# students.csv
name,course,marks
Asha,Python,92
Ravi,Django,78

# students.json
[{"name": "Asha", "course": "Python", "marks": 92}]
`,
    },
    {
      heading: "csv.reader and csv.writer",
      content: "csv.reader turns each line into a list of strings. csv.writer writes lists as rows, adding commas and quotes automatically (a value like \"Pune, MH\" is quoted). Always open CSV files with newline=\"\" to avoid blank lines between rows on Windows. Every value read from CSV is a STRING - convert numbers with int()/float().",
      syntax: `import csv
with open("data.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["name", "marks"])
    w.writerows([["Asha", 92], ["Ravi", 78]])

with open("data.csv", newline="") as f:
    for row in csv.reader(f):
        print(row)
`,
    },
    {
      heading: "DictReader and DictWriter",
      content: "DictReader uses the first row as headers and gives each row as a dict, so you can write row[\"marks\"] instead of row[2]. DictWriter needs fieldnames and writeheader(); then writerow(dict). This is clearer and safer when columns move around. Use delimiter=\";\" or \"\\t\" for other separators.",
      syntax: `with open("data.csv", newline="") as f:
    for row in csv.DictReader(f):
        print(row["name"], int(row["marks"]))
`,
    },
    {
      heading: "json: dump, dumps, load, loads",
      content: "json.dumps(obj) converts Python to a JSON string (\"s\" = string); json.dump(obj, file) writes it to a file. json.loads(text) parses a JSON string; json.load(file) reads from a file. Use indent=2 for pretty output, sort_keys=True for sorted keys, ensure_ascii=False to keep non-English characters readable.",
      syntax: `import json
text = json.dumps({"name": "Asha", "skills": ["py", "sql"]}, indent=2)
data = json.loads(text)
with open("data.json", "w") as f:
    json.dump(data, f, indent=2)
with open("data.json") as f:
    data = json.load(f)
`,
    },
    {
      heading: "Python <-> JSON Type Mapping and Pitfalls",
      content: "dict <-> object, list/tuple -> array, str <-> string, int/float <-> number, True/False <-> true/false, None <-> null. Tuples come back as lists. JSON object keys are always strings, so {1: \"a\"} becomes {\"1\": \"a\"}. Sets, datetime and custom objects are not serializable by default - convert them first or use default=str. Invalid JSON (single quotes, trailing commas) raises json.JSONDecodeError.",
      tip: "JSON uses double quotes only. {'a': 1} is a Python dict repr, not valid JSON.",
    },
  ],
  examples: [
    {
      title: "Write and Read a CSV with csv.writer / csv.reader",
      scenario: "Save student marks to a CSV file and read them back to calculate the class average.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import csv

rows = [["name", "city", "marks"],
        ["Asha", "Pune, MH", 92],
        ["Ravi", "Delhi", 78],
        ["Neha", "Agra", 85]]

with open("students.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerows(rows)

print(open("students.csv").read())

with open("students.csv", newline="") as f:
    reader = csv.reader(f)
    header = next(reader)          # skip header row
    print("Header:", header)
    marks = []
    for row in reader:
        print(row)
        marks.append(int(row[2]))   # values are strings!
print("Average:", round(sum(marks) / len(marks), 2))
`,
      python: {
        files: {
          "main.py": `import csv

rows = [["name", "city", "marks"],
        ["Asha", "Pune, MH", 92],
        ["Ravi", "Delhi", 78],
        ["Neha", "Agra", 85]]

with open("students.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerows(rows)

print(open("students.csv").read())

with open("students.csv", newline="") as f:
    reader = csv.reader(f)
    header = next(reader)          # skip header row
    print("Header:", header)
    marks = []
    for row in reader:
        print(row)
        marks.append(int(row[2]))   # values are strings!
print("Average:", round(sum(marks) / len(marks), 2))
`,
        },
      },
      result: `name,city,marks
Asha,"Pune, MH",92
Ravi,Delhi,78
Neha,Agra,85

Header: ['name', 'city', 'marks']
['Asha', 'Pune, MH', '92']
['Ravi', 'Delhi', '78']
['Neha', 'Agra', '85']
Average: 85.0`,
      explanation: "csv.writer automatically quotes \"Pune, MH\" because it contains a comma. The reader returns lists of strings, so marks are converted with int(). next(reader) skips the header.",
    },
    {
      title: "DictReader and DictWriter: Sales Report",
      scenario: "Read sales data by column name, calculate totals per region and write a summary CSV.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import csv
from collections import defaultdict

with open("sales.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=["region", "product", "amount"])
    w.writeheader()
    w.writerows([
        {"region": "North", "product": "Pen", "amount": 1200},
        {"region": "South", "product": "Book", "amount": 800},
        {"region": "North", "product": "Bag", "amount": 2500},
        {"region": "South", "product": "Pen", "amount": 600},
        {"region": "West", "product": "Book", "amount": 1500},
    ])

totals = defaultdict(int)
with open("sales.csv", newline="") as f:
    for row in csv.DictReader(f):
        totals[row["region"]] += int(row["amount"])

with open("summary.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=["region", "total"])
    w.writeheader()
    for region, total in sorted(totals.items(), key=lambda x: -x[1]):
        w.writerow({"region": region, "total": total})

print(open("summary.csv").read(), end="")
`,
      python: {
        files: {
          "main.py": `import csv
from collections import defaultdict

with open("sales.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=["region", "product", "amount"])
    w.writeheader()
    w.writerows([
        {"region": "North", "product": "Pen", "amount": 1200},
        {"region": "South", "product": "Book", "amount": 800},
        {"region": "North", "product": "Bag", "amount": 2500},
        {"region": "South", "product": "Pen", "amount": 600},
        {"region": "West", "product": "Book", "amount": 1500},
    ])

totals = defaultdict(int)
with open("sales.csv", newline="") as f:
    for row in csv.DictReader(f):
        totals[row["region"]] += int(row["amount"])

with open("summary.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=["region", "total"])
    w.writeheader()
    for region, total in sorted(totals.items(), key=lambda x: -x[1]):
        w.writerow({"region": region, "total": total})

print(open("summary.csv").read(), end="")
`,
        },
      },
      result: `region,total
North,3700
West,1500
South,1400`,
      explanation: "DictWriter writes dicts using the given fieldnames; DictReader returns each row as a dict keyed by the header. The totals are grouped with defaultdict and written sorted from highest to lowest.",
    },
    {
      title: "JSON: dumps, loads, dump, load",
      scenario: "Save an app's user settings to a JSON file and load them back later.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import json

settings = {
    "user": "asha",
    "theme": "dark",
    "notifications": True,
    "volume": 0.8,
    "languages": ["English", "हिन्दी"],
    "last_login": None,
    "window": (1280, 720),
}

text = json.dumps(settings)
print(text)
print(type(text).__name__)

with open("settings.json", "w", encoding="utf-8") as f:
    json.dump(settings, f, indent=2, ensure_ascii=False)

with open("settings.json", encoding="utf-8") as f:
    loaded = json.load(f)
print(loaded["languages"], loaded["window"], loaded["notifications"])
print(loaded == settings)

print(json.loads('{"a": 1, "b": [true, null]}'))
`,
      python: {
        files: {
          "main.py": `import json

settings = {
    "user": "asha",
    "theme": "dark",
    "notifications": True,
    "volume": 0.8,
    "languages": ["English", "हिन्दी"],
    "last_login": None,
    "window": (1280, 720),
}

text = json.dumps(settings)
print(text)
print(type(text).__name__)

with open("settings.json", "w", encoding="utf-8") as f:
    json.dump(settings, f, indent=2, ensure_ascii=False)

with open("settings.json", encoding="utf-8") as f:
    loaded = json.load(f)
print(loaded["languages"], loaded["window"], loaded["notifications"])
print(loaded == settings)

print(json.loads('{"a": 1, "b": [true, null]}'))
`,
        },
      },
      result: `{"user": "asha", "theme": "dark", "notifications": true, "volume": 0.8, "languages": ["English", "\\u0939\\u093f\\u0928\\u094d\\u0926\\u0940"], "last_login": null, "window": [1280, 720]}
str
['English', 'हिन्दी'] [1280, 720] True
False
{'a': 1, 'b': [True, None]}`,
      explanation: "dumps produces a string: True becomes true, None becomes null, the tuple becomes an array and non-ASCII text is escaped by default. With ensure_ascii=False the file keeps Hindi text readable. After load, the tuple has become a list, so the loaded dict is not equal to the original.",
    },
    {
      title: "CSV to JSON Converter with Error Handling",
      scenario: "Convert an employee CSV into nested JSON grouped by department, and handle invalid JSON safely.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import csv, json

with open("employees.csv", "w", newline="") as f:
    f.write("id,name,dept,salary\\n1,Asha,IT,65000\\n2,Ravi,HR,42000\\n3,Neha,IT,72000\\n")

result = {}
with open("employees.csv", newline="") as f:
    for row in csv.DictReader(f):
        emp = {"id": int(row["id"]), "name": row["name"], "salary": float(row["salary"])}
        result.setdefault(row["dept"], []).append(emp)

with open("employees.json", "w") as f:
    json.dump(result, f, indent=2)
print(open("employees.json").read())

bad = "{'name': 'Asha'}"        # single quotes are not valid JSON
try:
    json.loads(bad)
except json.JSONDecodeError as e:
    print("Invalid JSON:", e.msg, "at position", e.pos)

print(json.dumps({1: "one", "tags": sorted({"b", "a"})}))
`,
      python: {
        files: {
          "main.py": `import csv, json

with open("employees.csv", "w", newline="") as f:
    f.write("id,name,dept,salary\\n1,Asha,IT,65000\\n2,Ravi,HR,42000\\n3,Neha,IT,72000\\n")

result = {}
with open("employees.csv", newline="") as f:
    for row in csv.DictReader(f):
        emp = {"id": int(row["id"]), "name": row["name"], "salary": float(row["salary"])}
        result.setdefault(row["dept"], []).append(emp)

with open("employees.json", "w") as f:
    json.dump(result, f, indent=2)
print(open("employees.json").read())

bad = "{'name': 'Asha'}"        # single quotes are not valid JSON
try:
    json.loads(bad)
except json.JSONDecodeError as e:
    print("Invalid JSON:", e.msg, "at position", e.pos)

print(json.dumps({1: "one", "tags": sorted({"b", "a"})}))
`,
        },
      },
      result: `{
  "IT": [
    {
      "id": 1,
      "name": "Asha",
      "salary": 65000.0
    },
    {
      "id": 3,
      "name": "Neha",
      "salary": 72000.0
    }
  ],
  "HR": [
    {
      "id": 2,
      "name": "Ravi",
      "salary": 42000.0
    }
  ]
}
Invalid JSON: Expecting property name enclosed in double quotes at position 1
{"1": "one", "tags": ["a", "b"]}`,
      explanation: "Each CSV row is converted to proper types and grouped by department with setdefault. json.dump with indent=2 writes readable nested JSON. Invalid JSON raises JSONDecodeError. Integer keys become strings and a set must be converted to a list before dumping.",
    },
  ],
  interview: [
    {
      q: "What is the difference between json.dump and json.dumps?",
      a: "json.dump(obj, file) writes JSON to a file object. json.dumps(obj) returns the JSON as a string. Similarly load reads from a file and loads parses a string.",
      level: "Easy",
    },
    {
      q: "Why use newline=\"\" when opening CSV files?",
      a: "The csv module handles line endings itself. Without newline=\"\", Windows adds extra \\r characters, causing blank rows between records.",
      level: "Medium",
    },
    {
      q: "What type are values returned by csv.reader?",
      a: "Always strings. You must convert numbers yourself with int() or float().",
      level: "Easy",
    },
    {
      q: "What is the advantage of DictReader over reader?",
      a: "Each row is a dict keyed by the header names, so code uses row[\"salary\"] instead of positional indexes - more readable and robust if column order changes.",
      level: "Easy",
    },
    {
      q: `What is the output of this code?

import json
print(json.dumps({"ok": True, "val": None, "nums": (1, 2)}))
`,
      a: `Output:
{"ok": true, "val": null, "nums": [1, 2]}

True -> true, None -> null, tuple -> array.`,
      level: "Easy",
    },
    {
      q: `What is the output of this code?

import json
data = json.loads(json.dumps({1: "a", "t": (1, 2)}))
print(data)
`,
      a: `Output:
{'1': 'a', 't': [1, 2]}

JSON keys are always strings, so the int key 1 becomes "1", and tuples come back as lists after a round-trip.`,
      level: "Hard",
    },
    {
      q: `What is the output of this code?

import csv, io
buf = io.StringIO()
csv.writer(buf).writerow(["Asha", "Pune, MH", 'He said "hi"'])
print(buf.getvalue(), end="")
`,
      a: `Output:
Asha,"Pune, MH","He said ""hi"""

Values containing a comma or quote are wrapped in double quotes, and inner quotes are doubled - that is the CSV escaping rule.`,
      level: "Hard",
    },
    {
      q: "How do you serialize a datetime or set to JSON?",
      a: "They are not JSON serializable by default (TypeError). Convert them first (dt.isoformat(), list(my_set)) or pass default=str to json.dumps.",
      level: "Medium",
    },
    {
      q: "Which exception is raised for invalid JSON text?",
      a: "json.JSONDecodeError (a subclass of ValueError). It has msg, lineno, colno and pos attributes.",
      level: "Medium",
    },
    {
      q: "When would you choose CSV over JSON?",
      a: "CSV for flat, tabular data that will be opened in Excel or imported into databases. JSON for nested/hierarchical data, configuration and APIs.",
      level: "Easy",
    },
  ],
  practice: [
    {
      task: "Write 3 products (name, price, qty) to products.csv using csv.writer and then print the total stock value.",
      hint: "Read back with csv.reader, skip header, sum(price*qty).",
      solution: `import csv
with open("products.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["name", "price", "qty"])
    w.writerows([["Pen", 10, 100], ["Book", 120, 20], ["Bag", 700, 5]])
total = 0
with open("products.csv", newline="") as f:
    r = csv.reader(f)
    next(r)
    for name, price, qty in r:
        total += float(price) * int(qty)
print("Stock value:", total)
`,
    },
    {
      task: "Using DictReader, print the names of students who scored above 80 from a CSV with name,marks columns.",
      hint: "int(row[\"marks\"]) > 80",
      solution: `import csv
with open("m.csv", "w", newline="") as f:
    f.write("name,marks\\nAsha,92\\nRavi,78\\nNeha,85\\n")
with open("m.csv", newline="") as f:
    print([row["name"] for row in csv.DictReader(f) if int(row["marks"]) > 80])
`,
    },
    {
      task: "Store a to-do list (list of dicts with title and done) in todo.json, mark the first item done, save again and print the file.",
      hint: "json.load, modify, json.dump with indent=2.",
      solution: `import json
todos = [{"title": "Learn CSV", "done": False}, {"title": "Learn JSON", "done": False}]
with open("todo.json", "w") as f:
    json.dump(todos, f)
with open("todo.json") as f:
    todos = json.load(f)
todos[0]["done"] = True
with open("todo.json", "w") as f:
    json.dump(todos, f, indent=2)
print(open("todo.json").read())
`,
    },
    {
      task: "Convert a JSON array of users into a CSV file with columns id,name,email using DictWriter.",
      hint: "fieldnames=[\"id\", \"name\", \"email\"]; writer.writerows(users).",
      solution: `import csv, json
users = json.loads('[{"id": 1, "name": "Asha", "email": "a@x.com"}, {"id": 2, "name": "Ravi", "email": "r@x.com"}]')
with open("users.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=["id", "name", "email"])
    w.writeheader()
    w.writerows(users)
print(open("users.csv").read(), end="")
`,
    },
  ],
  quiz: [
    {
      question: "Which function converts a Python object to a JSON string?",
      options: [
        "json.load",
        "json.dumps",
        "json.parse",
        "json.loads",
      ],
      answer: 1,
      explanation: "dumps = dump to string.",
    },
    {
      question: "What does None become in JSON?",
      options: [
        "null",
        "None",
        "\"None\"",
        "undefined",
      ],
      answer: 0,
      explanation: "Python None maps to JSON null.",
    },
    {
      question: "What type is every value read by csv.reader?",
      options: [
        "int",
        "Depends on the data",
        "str",
        "bytes",
      ],
      answer: 2,
      explanation: "CSV values are always read as strings.",
    },
    {
      question: "Which method writes the header row with DictWriter?",
      options: [
        "writerow(header)",
        "header()",
        "writefields()",
        "writeheader()",
      ],
      answer: 3,
      explanation: "writeheader() writes the fieldnames row.",
    },
    {
      question: "What happens to a tuple after json.dumps then json.loads?",
      options: [
        "Stays a tuple",
        "Becomes a list",
        "Becomes a string",
        "Raises an error",
      ],
      answer: 1,
      explanation: "JSON has only arrays, which load as lists.",
    },
  ],
};
