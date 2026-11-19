export default {
  lesson: 'day-02-project-structure-linting-pre-commit',
  minutes: 25,
  intro: 'Practise professional project setup: src layout, virtual environments, requirements files, settings from environment variables, Ruff/Black and pre-commit hooks.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Why should every project have its own **virtual environment**?',
      options: ['It makes Python run faster', 'Each project gets its own isolated package versions, so projects do not break each other', 'It is required to use Git', 'It encrypts the source code'],
      answer: 1,
      explain: 'Project A may need Django 4.2 and project B Django 5.1. A venv (`python -m venv .venv`) keeps each project\'s packages separate from the others and from the system Python.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about Ruff, Black and pre-commit are TRUE? (choose all that apply)',
      options: ['Ruff is a very fast linter (and can also format code)', 'Black is an opinionated code formatter', 'pre-commit runs configured hooks automatically before each `git commit`', 'Linters change your program\'s behaviour to fix bugs', 'Tool settings can live in `pyproject.toml`'],
      answers: [0, 1, 2, 4],
      explain: 'Linters report problems (unused imports, undefined names, style issues) and formatters rewrite layout only; neither changes what correct code does. `.pre-commit-config.yaml` lists hooks; `pre-commit install` activates them for the repo.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Write the pip command that saves the exact versions of all installed packages into `requirements.txt`.',
      accept: ['pip freeze > requirements.txt', 'python -m pip freeze > requirements.txt', 'pip3 freeze > requirements.txt'],
      explain: '`pip freeze` prints `package==version` lines for everything installed in the active environment. Others recreate it with `pip install -r requirements.txt`.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'Ruff rule F401 = "imported but unused". This tiny checker mimics it. What does it print?',
      code: `import ast
src = """import os
import sys
from math import sqrt, pi
print(sqrt(16), sys.argv[0])
"""
tree = ast.parse(src)
imported = []
for node in ast.walk(tree):
    if isinstance(node, (ast.Import, ast.ImportFrom)):
        imported += [a.asname or a.name for a in node.names]
used = {n.id for n in ast.walk(tree) if isinstance(n, ast.Name)}
print(sorted(set(imported) - used))`,
      expected: "['os', 'pi']",
      explain: '`sqrt` and `sys` are used; `os` and `pi` are imported but never used, so a linter reports them (F401). `ruff check --fix` can remove such imports automatically.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Never hard-code secrets. Write `load_settings(env)` where `env` is a dict like `os.environ`. Return a dict with:\n- `database_url`: REQUIRED; if missing or empty raise `RuntimeError("DATABASE_URL is not set")`\n- `debug`: True only for `"1"`, `"true"`, `"yes"` (any case), default False\n- `allowed_hosts`: list from a comma-separated `ALLOWED_HOSTS` with spaces stripped and empty parts removed (default `[]`)\n\nAlso write `safe_load(env)` that returns the settings or the error message string.',
      example: { title: 'reading config from the environment', code: 'import os\nport = int(os.environ.get("PORT", "8000"))\nhosts = [h.strip() for h in "a.com, b.com".split(",")]' },
      starter: 'def load_settings(env):\n    # TODO\n    return {}\n\ndef safe_load(env):\n    try:\n        return load_settings(env)\n    except RuntimeError as e:\n        return str(e)\n',
      solution: 'def load_settings(env):\n    url = env.get("DATABASE_URL", "")\n    if not url:\n        raise RuntimeError("DATABASE_URL is not set")\n    return {\n        "database_url": url,\n        "debug": env.get("DEBUG", "").lower() in ("1", "true", "yes"),\n        "allowed_hosts": [h.strip() for h in env.get("ALLOWED_HOSTS", "").split(",") if h.strip()],\n    }\n\ndef safe_load(env):\n    try:\n        return load_settings(env)\n    except RuntimeError as e:\n        return str(e)\n',
      tests: [
        { call: 'safe_load({"DATABASE_URL": "postgres://db/shop", "DEBUG": "True", "ALLOWED_HOSTS": "shop.in, www.shop.in,"})', expect: { database_url: 'postgres://db/shop', debug: true, allowed_hosts: ['shop.in', 'www.shop.in'] } },
        { call: 'safe_load({"DATABASE_URL": "sqlite:///dev.db"})', expect: { database_url: 'sqlite:///dev.db', debug: false, allowed_hosts: [] } },
        { call: 'safe_load({"DEBUG": "1"})', expect: 'DATABASE_URL is not set' },
        { call: 'safe_load({"DATABASE_URL": ""})', expect: 'DATABASE_URL is not set' },
      ],
      explain: 'Failing fast with a clear error at start-up is much better than a confusing crash later. Environment values are strings, so parse booleans and lists explicitly; `bool("False")` is True.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'A pre-commit hook blocks commits that contain debugging leftovers. Write `find_problems(files)` where `files` is a dict `{path: source_text}`. Return a sorted list of strings `"path:line: message"` for:\n- a line containing `breakpoint()` → message `breakpoint`\n- a line with `print(` in any file under `src/` → message `print in src`\n\nLine numbers start at 1.',
      example: { title: 'enumerate lines from 1', code: 'for no, line in enumerate(text.splitlines(), start=1):\n    if "TODO" in line:\n        print(f"{path}:{no}: todo")' },
      starter: 'def find_problems(files):\n    problems = []\n    # TODO\n    return sorted(problems)\n',
      solution: 'def find_problems(files):\n    problems = []\n    for path, text in files.items():\n        for no, line in enumerate(text.splitlines(), start=1):\n            if "breakpoint()" in line:\n                problems.append(f"{path}:{no}: breakpoint")\n            if path.startswith("src/") and "print(" in line:\n                problems.append(f"{path}:{no}: print in src")\n    return sorted(problems)\n',
      tests: [
        { call: 'find_problems({"src/app.py": "x = 1\\nprint(x)\\nbreakpoint()", "tests/test_app.py": "print(\'ok\')"})', expect: ['src/app.py:2: print in src', 'src/app.py:3: breakpoint'] },
        { call: 'find_problems({"scripts/run.py": "breakpoint()"})', expect: ['scripts/run.py:1: breakpoint'] },
        { call: 'find_problems({"src/ok.py": "def f():\\n    return 1"})', expect: [] },
      ],
      explain: 'Hooks like this run on every commit, so mistakes never reach the shared repository. Real setups use ready-made hooks (Ruff rule T201 flags `print`, `debug-statements` flags breakpoints) configured in `.pre-commit-config.yaml`.',
    },
  ],
};
