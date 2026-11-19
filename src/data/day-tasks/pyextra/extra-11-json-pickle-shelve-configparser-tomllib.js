export default {
  lesson: 'extra-11-json-pickle-shelve-configparser-tomllib',
  minutes: 30,
  intro: 'Serialize data with json (including custom types), understand pickle\'s risks, and read INI and TOML configuration files.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'A user uploads a file to your web app. Which format is **unsafe** to load from that untrusted file?',
      options: ['JSON with `json.load`', 'TOML with `tomllib.load`', 'pickle with `pickle.load`', 'INI with `configparser`'],
      answer: 2,
      explain: 'Unpickling can **execute arbitrary code** (via `__reduce__`), so never unpickle data you did not create yourself. JSON, TOML and INI are plain data formats and are safe to parse.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `import json
data = {"name": "Asha", "marks": (90, 85), "active": True, "city": None}
text = json.dumps(data)
print(text)
back = json.loads(text)
print(back["marks"], back["active"])
print(json.dumps({"b": 1, "a": 2}, sort_keys=True))`,
      expected: '{"name": "Asha", "marks": [90, 85], "active": true, "city": null}\n[90, 85] True\n{"a": 2, "b": 1}',
      explain: 'JSON has no tuples, so a tuple becomes an array and comes back as a **list**. Python `True`/`None` become JSON `true`/`null` and are converted back by `loads`. `sort_keys=True` orders the keys.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Which `json.dumps` keyword argument prints the JSON on several lines with 2-space indentation? Write it like `name=value`.',
      accept: ['indent=2'],
      explain: '`json.dumps(obj, indent=2)` pretty-prints. Add `ensure_ascii=False` to keep non-English text such as "नमस्ते" readable instead of `\\u` escapes.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'An order has a `date` and `Decimal` amounts, which `json.dumps` cannot handle. Write `to_json(order)` that returns a JSON string using a `default=` function that converts `date`/`datetime` to ISO strings (`.isoformat()`) and `Decimal` to `str`. Any other unknown type must raise `TypeError`. Use `sort_keys=True`.',
      example: { title: 'default= hook', code: 'def encode(obj):\n    if isinstance(obj, set):\n        return sorted(obj)\n    raise TypeError(f"{type(obj).__name__} is not JSON serializable")\n\njson.dumps({"tags": {"b", "a"}}, default=encode)' },
      starter: 'import json\nfrom datetime import date, datetime\nfrom decimal import Decimal\n\ndef to_json(order):\n    # TODO\n    return json.dumps(order, sort_keys=True)\n',
      solution: 'import json\nfrom datetime import date, datetime\nfrom decimal import Decimal\n\ndef encode(obj):\n    if isinstance(obj, (date, datetime)):\n        return obj.isoformat()\n    if isinstance(obj, Decimal):\n        return str(obj)\n    raise TypeError(f"{type(obj).__name__} is not JSON serializable")\n\ndef to_json(order):\n    return json.dumps(order, default=encode, sort_keys=True)\n',
      tests: [
        { call: 'to_json({"id": 7, "on": date(2025, 3, 1), "total": Decimal("499.50")})', expect: '{"id": 7, "on": "2025-03-01", "total": "499.50"}' },
        { call: 'to_json({"items": ["pen"], "count": 1})', expect: '{"count": 1, "items": ["pen"]}' },
      ],
      explain: '`default` is called only for objects json does not understand; return something JSON-friendly or raise `TypeError` so real bugs are not hidden. Money is sent as a string so no precision is lost.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `read_db_config(text)` that parses INI text with `configparser` and returns a dict `{"host": str, "port": int, "debug": bool}` from the `[database]` section. Use `getint` and `getboolean`. If `port` is missing use 5432.',
      example: { title: 'configparser', code: 'import configparser\ncfg = configparser.ConfigParser()\ncfg.read_string("[app]\\nworkers = 4\\nlive = yes")\ncfg["app"].getint("workers")       # 4\ncfg["app"].getboolean("live")      # True' },
      starter: 'import configparser\n\ndef read_db_config(text):\n    # TODO\n    return {}\n',
      solution: 'import configparser\n\ndef read_db_config(text):\n    cfg = configparser.ConfigParser()\n    cfg.read_string(text)\n    db = cfg["database"]\n    return {\n        "host": db.get("host"),\n        "port": db.getint("port", fallback=5432),\n        "debug": db.getboolean("debug", fallback=False),\n    }\n',
      tests: [
        { call: 'read_db_config("[database]\\nhost = db.local\\nport = 3306\\ndebug = yes\\n")', expect: { host: 'db.local', port: 3306, debug: true } },
        { call: 'read_db_config("[database]\\nhost = 10.0.0.5\\ndebug = off\\n")', expect: { host: '10.0.0.5', port: 5432, debug: false } },
      ],
      explain: 'Everything in an INI file is a **string**; `getint` and `getboolean` convert ("yes", "on", "true", "1" are True). `fallback=` gives a default when a key is missing instead of raising an error.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `project_info(toml_text)` that parses TOML text with `tomllib.loads` and returns `(name, version, number_of_dependencies)` from the `[project]` table (dependencies may be missing → 0).',
      example: { title: 'tomllib', code: 'import tomllib\ndata = tomllib.loads(\'title = "Demo"\\n[owner]\\nname = "Asha"\')\nprint(data["owner"]["name"])' },
      starter: 'import tomllib\n\ndef project_info(toml_text):\n    # TODO\n    return None\n',
      solution: 'import tomllib\n\ndef project_info(toml_text):\n    project = tomllib.loads(toml_text)["project"]\n    return (project["name"], project["version"], len(project.get("dependencies", [])))\n',
      tests: [
        { call: 'project_info(\'[project]\\nname = "shopkit"\\nversion = "1.2.0"\\ndependencies = ["requests>=2.31", "rich"]\\n\')', expect: ['shopkit', '1.2.0', 2] },
        { call: 'project_info(\'[project]\\nname = "mini"\\nversion = "0.1.0"\\n\')', expect: ['mini', '0.1.0', 0] },
      ],
      explain: '`tomllib` (Python 3.11+) only **reads** TOML: use `loads` for a string and `load` with a file opened in binary mode (`"rb"`). TOML values keep their types: strings, lists, numbers and booleans.',
    },
  ],
};
