export default {
  id: "extra-11-json-pickle-shelve-configparser-tomllib",
  title: "Data Serialization: json, pickle, shelve, configparser and tomllib",
  module: "Module 2: Standard Library Power Tools",
  extraNo: 11,
  level: "Intermediate",
  duration: "2.5 hours",
  summary: "Save and load Python data in the right format: JSON for APIs and cross-language exchange (including custom encoders for dates and Decimals), pickle for Python-only object snapshots (and why it is unsafe with untrusted data), shelve for a simple persistent dictionary, configparser for INI settings files and tomllib for reading pyproject.toml-style TOML config.",
  objectives: [
    "Convert between Python objects and JSON with dumps/loads/dump/load",
    "Serialize custom types (datetime, Decimal, dataclass) to JSON",
    "Use pickle correctly and explain its security risk",
    "Store key-value data on disk with shelve",
    "Read and write INI files with configparser and read TOML with tomllib",
  ],
  theory: [
    {
      heading: "What is Serialization?",
      content: `**Serialization** converts in-memory objects into a format that can be stored in a file, sent over a network or saved in a database. **Deserialization** rebuilds the objects. Choosing the format depends on who reads the data:

JSON - text, human-readable, language-independent: REST APIs, config, logs. pickle - binary, Python-only, supports almost any Python object: caching, ML models. shelve - pickle-backed persistent dict. INI (configparser) - simple sectioned settings. TOML (tomllib) - modern config format used by pyproject.toml.`,
      points: [
        "Text formats are diff-friendly and readable; binary formats are compact and fast",
        "Only JSON/TOML/INI are safe to read from untrusted sources",
        "Python 3.11 added tomllib (read-only) to the standard library",
      ],
    },
    {
      heading: "json: dumps, loads, dump, load",
      content: `\`json.dumps(obj)\` returns a JSON string; \`json.loads(text)\` parses a string. \`json.dump(obj, file)\` and \`json.load(file)\` work with open files (the 's' means string). Useful arguments: \`indent=2\` pretty-prints, \`sort_keys=True\`, \`ensure_ascii=False\` keeps characters like ₹ and Hindi text readable, \`separators=(',', ':')\` for compact output.

Type mapping: dict ↔ object, list/tuple → array (tuples come back as lists), str ↔ string, int/float ↔ number, True/False ↔ true/false, None ↔ null. JSON object keys are always strings, so \`{1: 'a'}\` comes back as \`{'1': 'a'}\`.`,
      syntax: `import json
text = json.dumps({"name": "Asha", "skills": ["python"]}, indent=2)
data = json.loads('{"id": 1, "active": true, "manager": null}')
with open("user.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
`,
    },
    {
      heading: "JSON for Custom Types",
      content: "json only knows basic types. `datetime`, `Decimal`, `set`, dataclasses and custom classes raise `TypeError: Object of type X is not JSON serializable`. Solutions: pass `default=func` to dumps (called for unknown objects, return a serializable value), or subclass `json.JSONEncoder` and override `default()`. For loading, `object_hook=func` lets you transform every decoded dict, e.g. converting ISO strings back to dates. `parse_float=Decimal` reads numbers as Decimal for money.",
      tip: "In real projects, libraries like pydantic handle model <-> JSON conversion with validation; but interviewers expect you to know `default=` and `object_hook=`.",
    },
    {
      heading: "pickle: Python Object Serialization",
      content: `\`pickle.dumps(obj)\` / \`pickle.loads(data)\` (and dump/load with files opened in **binary mode** 'wb'/'rb') can save almost any Python object: custom class instances, nested structures, sets, tuples, dates. It preserves types exactly. It cannot pickle open files, sockets, lambdas or locks.

**Security warning:** unpickling executes code chosen by whoever created the data (via \`__reduce__\`). Never unpickle data from untrusted sources (user uploads, network). Pickle is also Python-specific and can break across library versions, so it is not a good long-term storage or API format.`,
      syntax: `import pickle
with open("model.pkl", "wb") as f:
    pickle.dump(obj, f)
with open("model.pkl", "rb") as f:
    obj = pickle.load(f)
`,
    },
    {
      heading: "shelve: A Persistent Dictionary",
      content: `\`shelve.open(filename)\` returns a dict-like object stored on disk. Keys must be strings; values can be any picklable object. It is handy for small scripts, caches and prototypes - no database needed. Use it as a context manager so it is closed properly.

Gotcha: modifying a mutable value in place (\`db['cart'].append(x)\`) is NOT saved unless you reassign it (\`cart = db['cart']; cart.append(x); db['cart'] = cart\`) or open with \`writeback=True\` (which uses more memory). The same pickle security warning applies.`,
    },
    {
      heading: "configparser (INI) and tomllib (TOML)",
      content: `**INI** files have \`[sections]\` with \`key = value\` pairs. \`configparser.ConfigParser\` reads them; values are strings, but helpers \`getint\`, \`getfloat\` and \`getboolean\` (accepts yes/no, on/off, true/false, 1/0) convert them. A \`[DEFAULT]\` section supplies values to all sections, and \`%(name)s\` interpolation can reference other keys. You can also write INI files with \`config.write(f)\`.

**TOML** is a richer config format with real types (strings, ints, floats, booleans, dates, arrays, tables). Python 3.11+ includes \`tomllib\` to **read** TOML: \`tomllib.load(f)\` needs a binary file (\`'rb'\`), and \`tomllib.loads(text)\` parses a string. To write TOML use the third-party \`tomli-w\` package.`,
      syntax: `import tomllib
with open("pyproject.toml", "rb") as f:
    data = tomllib.load(f)
data["project"]["name"]
`,
    },
  ],
  examples: [
    {
      title: "JSON Round Trip for an API Payload",
      scenario: "A backend receives an order as JSON, processes it and sends a pretty-printed response containing Hindi text and a rupee symbol.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import json

request_body = '{"order_id": 101, "items": [{"sku": "P1", "qty": 2, "price": 249.5}], "paid": false, "coupon": null}'
order = json.loads(request_body)
print(type(order), order["items"][0]["price"], order["paid"], order["coupon"])

order["total"] = sum(i["qty"] * i["price"] for i in order["items"])
order["paid"] = True
order["message"] = "धन्यवाद! Total ₹" + str(order["total"])
print(json.dumps(order, indent=2, ensure_ascii=False))
print(json.dumps({"msg": "₹"}))
print(json.dumps({"b": 1, "a": [1, 2]}, sort_keys=True, separators=(",", ":")))

print(json.loads(json.dumps({1: (1, 2)})))
try:
    json.loads("{'single': 'quotes'}")
except json.JSONDecodeError as e:
    print("Invalid JSON:", e.msg, "at position", e.pos)
`,
      python: {
        files: {
          "main.py": `import json

request_body = '{"order_id": 101, "items": [{"sku": "P1", "qty": 2, "price": 249.5}], "paid": false, "coupon": null}'
order = json.loads(request_body)
print(type(order), order["items"][0]["price"], order["paid"], order["coupon"])

order["total"] = sum(i["qty"] * i["price"] for i in order["items"])
order["paid"] = True
order["message"] = "धन्यवाद! Total ₹" + str(order["total"])
print(json.dumps(order, indent=2, ensure_ascii=False))
print(json.dumps({"msg": "₹"}))
print(json.dumps({"b": 1, "a": [1, 2]}, sort_keys=True, separators=(",", ":")))

print(json.loads(json.dumps({1: (1, 2)})))
try:
    json.loads("{'single': 'quotes'}")
except json.JSONDecodeError as e:
    print("Invalid JSON:", e.msg, "at position", e.pos)
`,
        },
      },
      result: `<class 'dict'> 249.5 False None
{
  "order_id": 101,
  "items": [
    {
      "sku": "P1",
      "qty": 2,
      "price": 249.5
    }
  ],
  "paid": true,
  "coupon": null,
  "total": 499.0,
  "message": "धन्यवाद! Total ₹499.0"
}
{"msg": "\\u20b9"}
{"a":[1,2],"b":1}
{'1': [1, 2]}
Invalid JSON: Expecting property name enclosed in double quotes at position 1`,
      explanation: "loads converts true/false/null to True/False/None. ensure_ascii=False keeps Unicode readable; the default escapes it as \\u20b9. Tuples become lists and int keys become strings after a round trip. JSON requires double quotes, so the last string fails with JSONDecodeError.",
    },
    {
      title: "Serializing Dates, Decimals and Dataclasses",
      scenario: "An invoice dataclass with a date and Decimal amount must be saved as JSON and loaded back with proper types.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import json
from dataclasses import dataclass, asdict
from datetime import date
from decimal import Decimal

@dataclass
class Invoice:
    number: str
    issued: date
    amount: Decimal
    tags: set

inv = Invoice("INV-7", date(2025, 4, 1), Decimal("1499.90"), {"gst"})

try:
    json.dumps(asdict(inv))
except TypeError as e:
    print("Error:", e)

def to_json(obj):
    if isinstance(obj, date):
        return obj.isoformat()
    if isinstance(obj, Decimal):
        return str(obj)
    if isinstance(obj, set):
        return sorted(obj)
    raise TypeError(f"Cannot serialize {type(obj).__name__}")

text = json.dumps(asdict(inv), default=to_json)
print(text)

def from_json(d):
    if "issued" in d:
        d["issued"] = date.fromisoformat(d["issued"])
        d["amount"] = Decimal(d["amount"])
        d["tags"] = set(d["tags"])
    return d

restored = Invoice(**json.loads(text, object_hook=from_json))
print(restored)
print(restored == inv)
print(json.loads('{"price": 0.1}', parse_float=Decimal))
`,
      python: {
        files: {
          "main.py": `import json
from dataclasses import dataclass, asdict
from datetime import date
from decimal import Decimal

@dataclass
class Invoice:
    number: str
    issued: date
    amount: Decimal
    tags: set

inv = Invoice("INV-7", date(2025, 4, 1), Decimal("1499.90"), {"gst"})

try:
    json.dumps(asdict(inv))
except TypeError as e:
    print("Error:", e)

def to_json(obj):
    if isinstance(obj, date):
        return obj.isoformat()
    if isinstance(obj, Decimal):
        return str(obj)
    if isinstance(obj, set):
        return sorted(obj)
    raise TypeError(f"Cannot serialize {type(obj).__name__}")

text = json.dumps(asdict(inv), default=to_json)
print(text)

def from_json(d):
    if "issued" in d:
        d["issued"] = date.fromisoformat(d["issued"])
        d["amount"] = Decimal(d["amount"])
        d["tags"] = set(d["tags"])
    return d

restored = Invoice(**json.loads(text, object_hook=from_json))
print(restored)
print(restored == inv)
print(json.loads('{"price": 0.1}', parse_float=Decimal))
`,
        },
      },
      result: `Error: Object of type date is not JSON serializable
{"number": "INV-7", "issued": "2025-04-01", "amount": "1499.90", "tags": ["gst"]}
Invoice(number='INV-7', issued=datetime.date(2025, 4, 1), amount=Decimal('1499.90'), tags={'gst'})
True
{'price': Decimal('0.1')}`,
      explanation: "The default= function converts unknown types to JSON-friendly values. object_hook runs on every decoded dict and rebuilds proper types, so the restored dataclass equals the original. parse_float=Decimal avoids float errors for money.",
    },
    {
      title: "pickle: Saving Python Objects (and the Danger)",
      scenario: "A data scientist caches a processed dataset with custom objects, and the security team demonstrates why untrusted pickles are dangerous.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import pickle
from datetime import datetime

class Model:
    def __init__(self, name, weights):
        self.name = name
        self.weights = weights
        self.trained_at = datetime(2025, 6, 1, 10, 30)
    def predict(self, x):
        return sum(w * x for w in self.weights)

m = Model("price-v1", [0.5, 1.5])
blob = pickle.dumps(m)
print(type(blob).__name__, "starts with", blob[:2])

with open("model.pkl", "wb") as f:
    pickle.dump({"model": m, "labels": {"cheap", "costly"}, "shape": (2, 1)}, f)
with open("model.pkl", "rb") as f:
    data = pickle.load(f)
loaded = data["model"]
print(loaded.name, loaded.trained_at, loaded.predict(10), type(data["shape"]).__name__)

try:
    pickle.dumps(lambda x: x)
except (pickle.PicklingError, AttributeError) as e:
    print("Cannot pickle:", type(e).__name__)

class Evil:
    def __reduce__(self):
        return (print, ("!!! code executed during unpickling !!!",))

pickle.loads(pickle.dumps(Evil()))
`,
      python: {
        files: {
          "main.py": `import pickle
from datetime import datetime

class Model:
    def __init__(self, name, weights):
        self.name = name
        self.weights = weights
        self.trained_at = datetime(2025, 6, 1, 10, 30)
    def predict(self, x):
        return sum(w * x for w in self.weights)

m = Model("price-v1", [0.5, 1.5])
blob = pickle.dumps(m)
print(type(blob).__name__, "starts with", blob[:2])

with open("model.pkl", "wb") as f:
    pickle.dump({"model": m, "labels": {"cheap", "costly"}, "shape": (2, 1)}, f)
with open("model.pkl", "rb") as f:
    data = pickle.load(f)
loaded = data["model"]
print(loaded.name, loaded.trained_at, loaded.predict(10), type(data["shape"]).__name__)

try:
    pickle.dumps(lambda x: x)
except (pickle.PicklingError, AttributeError) as e:
    print("Cannot pickle:", type(e).__name__)

class Evil:
    def __reduce__(self):
        return (print, ("!!! code executed during unpickling !!!",))

pickle.loads(pickle.dumps(Evil()))
`,
        },
      },
      result: `bytes starts with b'\\x80\\x04'
price-v1 2025-06-01 10:30:00 20.0 tuple
Cannot pickle: PicklingError
!!! code executed during unpickling !!!`,
      explanation: "pickle stores the full object, including the custom class instance, datetime, set and tuple types. Files must be opened in binary mode. Lambdas cannot be pickled. The Evil class shows that unpickling can call any function - here harmless print, but an attacker could call os.system.",
    },
    {
      title: "Reading and Writing INI Config with configparser",
      scenario: "A web app reads database and feature settings from an INI file with defaults and typed getters.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import configparser

ini_text = """
[DEFAULT]
timeout = 30
log_dir = /var/log/myapp

[database]
host = db.internal
port = 5432
use_ssl = yes

[features]
new_checkout = off
max_items = 25
log_file = %(log_dir)s/features.log
"""

config = configparser.ConfigParser()
config.read_string(ini_text)
print(config.sections())
db = config["database"]
print(db["host"], db.getint("port") + 1, db.getboolean("use_ssl"), db.getint("timeout"))
print(config.getboolean("features", "new_checkout"), config["features"]["log_file"])
print(config.get("database", "user", fallback="app_user"))

config["cache"] = {"backend": "redis", "ttl": "300"}
config.set("features", "max_items", "50")
with open("app.ini", "w") as f:
    config.write(f)

check = configparser.ConfigParser()
check.read("app.ini")
print(check["cache"]["ttl"], check["features"].getint("max_items"))
`,
      python: {
        files: {
          "main.py": `import configparser

ini_text = """
[DEFAULT]
timeout = 30
log_dir = /var/log/myapp

[database]
host = db.internal
port = 5432
use_ssl = yes

[features]
new_checkout = off
max_items = 25
log_file = %(log_dir)s/features.log
"""

config = configparser.ConfigParser()
config.read_string(ini_text)
print(config.sections())
db = config["database"]
print(db["host"], db.getint("port") + 1, db.getboolean("use_ssl"), db.getint("timeout"))
print(config.getboolean("features", "new_checkout"), config["features"]["log_file"])
print(config.get("database", "user", fallback="app_user"))

config["cache"] = {"backend": "redis", "ttl": "300"}
config.set("features", "max_items", "50")
with open("app.ini", "w") as f:
    config.write(f)

check = configparser.ConfigParser()
check.read("app.ini")
print(check["cache"]["ttl"], check["features"].getint("max_items"))
`,
        },
      },
      result: `['database', 'features']
db.internal 5433 True 30
False /var/log/myapp/features.log
app_user
300 50`,
      explanation: "All INI values are strings; getint/getboolean convert them ('yes'/'off' become booleans). DEFAULT keys (timeout) are inherited by every section. %(log_dir)s interpolation reuses another key. fallback avoids errors for missing keys. config.write saves the file.",
    },
    {
      title: "Reading TOML Config with tomllib",
      scenario: "A tool reads its settings from a TOML file similar to pyproject.toml, with real types, arrays and nested tables.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import tomllib

toml_text = """
[project]
name = "salestool"
version = "1.4.0"
requires-python = ">=3.11"
dependencies = ["requests>=2.31", "rich"]

[tool.salestool]
debug = false
max_rows = 500
release_date = 2025-07-01
regions = ["North", "South"]

[[tool.salestool.reports]]
name = "daily"
cron = "0 9 * * *"

[[tool.salestool.reports]]
name = "weekly"
cron = "0 9 * * 1"
"""

data = tomllib.loads(toml_text)
project = data["project"]
cfg = data["tool"]["salestool"]
print(project["name"], project["version"], project["dependencies"])
print(cfg["debug"], type(cfg["max_rows"]).__name__, repr(cfg["release_date"]))
print([r["name"] for r in cfg["reports"]])

with open("settings.toml", "w", encoding="utf-8") as f:
    f.write(toml_text)
with open("settings.toml", "rb") as f:
    print(tomllib.load(f)["tool"]["salestool"]["regions"])

try:
    tomllib.loads("name = unquoted text")
except tomllib.TOMLDecodeError as e:
    print("TOMLDecodeError:", e)
`,
      python: {
        files: {
          "main.py": `import tomllib

toml_text = """
[project]
name = "salestool"
version = "1.4.0"
requires-python = ">=3.11"
dependencies = ["requests>=2.31", "rich"]

[tool.salestool]
debug = false
max_rows = 500
release_date = 2025-07-01
regions = ["North", "South"]

[[tool.salestool.reports]]
name = "daily"
cron = "0 9 * * *"

[[tool.salestool.reports]]
name = "weekly"
cron = "0 9 * * 1"
"""

data = tomllib.loads(toml_text)
project = data["project"]
cfg = data["tool"]["salestool"]
print(project["name"], project["version"], project["dependencies"])
print(cfg["debug"], type(cfg["max_rows"]).__name__, repr(cfg["release_date"]))
print([r["name"] for r in cfg["reports"]])

with open("settings.toml", "w", encoding="utf-8") as f:
    f.write(toml_text)
with open("settings.toml", "rb") as f:
    print(tomllib.load(f)["tool"]["salestool"]["regions"])

try:
    tomllib.loads("name = unquoted text")
except tomllib.TOMLDecodeError as e:
    print("TOMLDecodeError:", e)
`,
        },
      },
      result: `salestool 1.4.0 ['requests>=2.31', 'rich']
False int datetime.date(2025, 7, 1)
['daily', 'weekly']
['North', 'South']
TOMLDecodeError: Invalid value (at line 1, column 8)`,
      explanation: "TOML values keep their types: booleans, ints, dates (as datetime.date) and arrays. [[...]] defines an array of tables, giving a list of dicts. tomllib.load requires a file opened in binary mode ('rb'). Invalid TOML raises TOMLDecodeError.",
    },
  ],
  interview: [
    {
      q: "What is the difference between json.dump and json.dumps?",
      a: "dumps returns a JSON string; dump writes JSON directly to a file-like object. Similarly loads parses a string/bytes and load reads from a file object.",
      level: "Easy",
    },
    {
      q: "How does JSON map to Python types?",
      a: "object → dict, array → list, string → str, number → int or float, true/false → True/False, null → None. On encoding, tuples become arrays (lists after decoding) and non-string dict keys are converted to strings.",
      level: "Easy",
    },
    {
      q: "How do you serialize a datetime to JSON?",
      a: "Convert it to an ISO 8601 string. Either pass `default=lambda o: o.isoformat()` (with type checks) to json.dumps, or subclass JSONEncoder and override default(). On loading, use object_hook or datetime.fromisoformat to convert back.",
      level: "Medium",
    },
    {
      q: "What does ensure_ascii=False do?",
      a: "By default json.dumps escapes all non-ASCII characters as \\uXXXX. With ensure_ascii=False it outputs the characters as-is (e.g. ₹, é, Hindi text), which is more readable. Write the file with encoding='utf-8'.",
      level: "Medium",
    },
    {
      q: "JSON vs pickle - when to use which?",
      a: "JSON is text, human-readable, language-independent and safe to parse, but supports only basic types - use for APIs, configs and data exchange. pickle is binary, Python-only, supports almost any Python object - use for internal caching or short-term storage of trusted data. Never unpickle untrusted data.",
      level: "Medium",
    },
    {
      q: "Why is unpickling untrusted data dangerous?",
      a: "The pickle format can instruct the loader to import and call arbitrary callables (via __reduce__), so a crafted pickle can run `os.system('rm -rf ...')` the moment you call pickle.load. It is effectively remote code execution. Use JSON or sign/verify data (hmac) if you must accept pickles.",
      level: "Hard",
    },
    {
      q: "What cannot be pickled?",
      a: "Objects tied to OS resources or runtime state: open files, sockets, database connections, threads and locks, generators, and lambdas/nested functions (pickle stores functions by importable name). Classes can customise pickling with __getstate__/__setstate__ or __reduce__.",
      level: "Hard",
    },
    {
      q: "What is shelve and what is its main gotcha?",
      a: "shelve provides a persistent dictionary backed by dbm and pickle; keys are strings and values any picklable object. Gotcha: mutating a stored mutable value in place does not persist unless you reassign it or open the shelf with writeback=True.",
      level: "Medium",
    },
    {
      q: "How does configparser handle types?",
      a: "Everything is stored as strings. Use getint(), getfloat() and getboolean() to convert; getboolean accepts '1/yes/true/on' and '0/no/false/off' case-insensitively. Use fallback= for defaults and the [DEFAULT] section for shared values.",
      level: "Medium",
    },
    {
      q: "What is tomllib and why does load need 'rb'?",
      a: "tomllib (Python 3.11+) is the standard-library TOML parser (read only). TOML must be UTF-8, so tomllib.load takes a binary file and decodes it itself, which avoids platform-dependent text encoding issues. Use tomli-w to write TOML.",
      level: "Medium",
    },
    {
      q: "Why does json.loads(json.dumps({1: 'a'})) give {'1': 'a'}?",
      a: "JSON object keys must be strings, so the int key 1 is converted to '1' when encoding. Decoding does not know it was an int. Convert keys back manually if needed.",
      level: "Easy",
    },
    {
      q: "How would you load monetary values from JSON without float errors?",
      a: "Use `json.loads(text, parse_float=Decimal)` so numbers with decimals become Decimal objects. When dumping, convert Decimals to strings (or use a custom encoder) to keep exact values.",
      level: "Hard",
    },
  ],
  practice: [
    {
      task: "Write a list of 3 student dicts (name, marks list) to students.json with indent=2, read it back, and print each student's average.",
      hint: "json.dump(..., f, indent=2) then json.load(f).",
      solution: `import json

students = [{"name": "Asha", "marks": [80, 90]}, {"name": "Ravi", "marks": [70, 75]}, {"name": "Meena", "marks": [95, 85]}]
with open("students.json", "w", encoding="utf-8") as f:
    json.dump(students, f, indent=2)
with open("students.json", encoding="utf-8") as f:
    loaded = json.load(f)
for s in loaded:
    print(s["name"], sum(s["marks"]) / len(s["marks"]))
`,
    },
    {
      task: "Create a JSONEncoder subclass that serializes datetime as ISO strings and sets as sorted lists. Use it with json.dumps(cls=...).",
      hint: "class MyEncoder(json.JSONEncoder): def default(self, o): ... return super().default(o)",
      solution: `import json
from datetime import datetime

class MyEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, datetime):
            return o.isoformat()
        if isinstance(o, set):
            return sorted(o)
        return super().default(o)

event = {"name": "Deploy", "at": datetime(2025, 9, 1, 18, 0), "servers": {"web2", "web1"}}
print(json.dumps(event, cls=MyEncoder))
`,
    },
    {
      task: "Use shelve to store a visit counter: open 'visits_db', increment db['count'] (start at 0) three times in separate with-blocks, and print the final value.",
      hint: "db['count'] = db.get('count', 0) + 1",
      solution: `import shelve

for _ in range(3):
    with shelve.open("visits_db") as db:
        db["count"] = db.get("count", 0) + 1
with shelve.open("visits_db") as db:
    print("Visits:", db["count"])
`,
    },
    {
      task: "Parse this INI text and print the SMTP host, port (as int) and whether TLS is enabled: [email] host = smtp.example.com, port = 587, tls = true.",
      hint: "config.read_string(text); config['email'].getint('port')",
      solution: `import configparser

text = """
[email]
host = smtp.example.com
port = 587
tls = true
"""
config = configparser.ConfigParser()
config.read_string(text)
email = config["email"]
print(email["host"], email.getint("port"), email.getboolean("tls"))
`,
    },
    {
      task: "Parse a TOML string describing [server] host='0.0.0.0', port=8000, workers=4 and [database] url='sqlite:///app.db' and print a startup line like 'Starting on 0.0.0.0:8000 with 4 workers'.",
      hint: "tomllib.loads(text)['server']",
      solution: `import tomllib

text = """
[server]
host = "0.0.0.0"
port = 8000
workers = 4

[database]
url = "sqlite:///app.db"
"""
cfg = tomllib.loads(text)
s = cfg["server"]
print(f"Starting on {s['host']}:{s['port']} with {s['workers']} workers")
print("DB:", cfg["database"]["url"])
`,
    },
  ],
  quiz: [
    {
      question: "What does json.loads('[1, true, null]') return?",
      options: [
        "[1, 'true', 'null']",
        "[1, True, None]",
        "(1, True, None)",
        "JSONDecodeError",
      ],
      answer: 1,
      explanation: "JSON true and null map to Python True and None; arrays become lists.",
    },
    {
      question: "Which mode must be used for pickle files?",
      options: [
        "'w' / 'r'",
        "'wb' / 'rb'",
        "'a' / 'r'",
        "Any text mode",
      ],
      answer: 1,
      explanation: "pickle produces bytes, so files must be opened in binary mode.",
    },
    {
      question: "Which statement about pickle is TRUE?",
      options: [
        "It is safe for untrusted data",
        "It is readable by JavaScript",
        "Unpickling can execute arbitrary code",
        "It only supports dicts and lists",
      ],
      answer: 2,
      explanation: "Malicious pickles can call arbitrary functions while loading.",
    },
    {
      question: "json.dumps({'when': datetime.now()}) without extra arguments...",
      options: [
        "Returns an ISO string",
        "Raises TypeError",
        "Returns a timestamp",
        "Returns null for the date",
      ],
      answer: 1,
      explanation: "datetime is not JSON serializable by default.",
    },
    {
      question: "In configparser, what type does config['db']['port'] return?",
      options: [
        "int",
        "str",
        "float",
        "Depends on the value",
      ],
      answer: 1,
      explanation: "All INI values are strings; use getint() to convert.",
    },
    {
      question: "tomllib in Python 3.11+ can...",
      options: [
        "Read and write TOML",
        "Only read TOML",
        "Only write TOML",
        "Read INI files",
      ],
      answer: 1,
      explanation: "tomllib is read-only; use tomli-w to write TOML.",
    },
  ],
};
