export default {
  id: "extra-19-dependency-management-pip-tools-poetry-uv",
  title: "Dependency Management with pip-tools, Poetry and uv",
  module: "Module 4: Packaging & Ecosystem",
  extraNo: 19,
  level: "Advanced",
  duration: "2.5 hours",
  summary: "Make installs reproducible and teams productive. Understand direct vs transitive dependencies, version conflicts and why lock files matter, then use three popular workflows: pip-tools (requirements.in -> pinned requirements.txt), Poetry (pyproject.toml + poetry.lock + virtualenv management) and uv (the very fast all-in-one tool: Python versions, venvs, locking, running and publishing). Learn when to choose each.",
  objectives: [
    "Explain direct vs transitive dependencies, dependency resolution and dependency hell",
    "Create reproducible environments with lock files and hashes",
    "Use pip-tools: pip-compile and pip-sync",
    "Use Poetry: add, install, lock, groups, run and build",
    "Use uv: init, add, sync, lock, run, python install and uvx; choose the right tool for a project",
  ],
  theory: [
    {
      heading: "The Dependency Problem",
      content: `Your project's **direct dependencies** are the packages you import (e.g. \`requests\`, \`django\`). Each of them has its own dependencies - **transitive dependencies** (\`requests\` needs \`urllib3\`, \`idna\`, \`certifi\`, \`charset-normalizer\`). A real project often has 5x more transitive than direct packages.

If \`requirements.txt\` only says \`requests\`, two developers installing a month apart can get different versions of requests and urllib3 - 'works on my machine' bugs and surprise breakages in production. Two packages may also require incompatible versions of the same library (**dependency conflict** / dependency hell). The installer's **resolver** must find one set of versions that satisfies all constraints, or fail with an error.`,
      points: [
        "Direct: what you ask for; transitive: what they need",
        "Unpinned installs are not reproducible",
        "pip has had a backtracking resolver since 20.3 (2020)",
      ],
    },
    {
      heading: "Virtual Environments, Constraints and Lock Files",
      content: `Always install project dependencies into a **virtual environment** (\`python -m venv .venv\`) so each project has its own isolated packages and does not pollute the system Python.

Separate two ideas: **abstract requirements** (what your code needs, flexible: \`django>=5.0,<6\`) and **concrete pins** (the exact tested set: \`django==5.1.4\`, \`asgiref==3.8.1\`, ...). A **lock file** records the exact versions (and usually file hashes) of every direct and transitive dependency. Commit it to Git. CI, colleagues and production install from the lock file and get byte-for-byte the same packages. Update it deliberately (e.g. weekly with Dependabot/Renovate) and run tests.`,
      tip: "`pip freeze > requirements.txt` is a quick lock, but it mixes direct and transitive packages without explaining why each is there and captures anything you installed by hand. The tools below do this properly.",
    },
    {
      heading: "pip-tools: pip-compile and pip-sync",
      content: `pip-tools is a small, focused tool that works with plain pip and requirements files. You write your direct dependencies with loose constraints in **requirements.in** (or read them from pyproject.toml). \`pip-compile\` resolves everything and writes a fully pinned **requirements.txt**, with \`# via\` comments explaining why each transitive package is present. \`pip-sync\` makes the virtual environment match the file exactly - installing missing packages and **uninstalling** extras.

Useful options: \`--generate-hashes\` (pip verifies every download), \`--upgrade\` or \`--upgrade-package requests\` (controlled updates), separate \`dev-requirements.in\` that starts with \`-c requirements.txt\` to stay consistent.`,
      syntax: `pip install pip-tools
# requirements.in
django>=5.0,<6
requests

pip-compile requirements.in            # -> requirements.txt (pinned)
pip-compile --generate-hashes requirements.in
pip-compile --upgrade-package requests requirements.in
pip-sync requirements.txt dev-requirements.txt
`,
    },
    {
      heading: "Poetry",
      content: `**Poetry** is an all-in-one project manager: it keeps dependencies in pyproject.toml, writes **poetry.lock**, creates and manages a virtual environment for the project, and builds/publishes packages. Poetry 2.x supports the standard \`[project]\` table (older projects use \`[tool.poetry.dependencies]\` with caret constraints like \`^2.31\`, meaning >=2.31,<3).

Common commands: \`poetry new\` / \`poetry init\`, \`poetry add requests\`, \`poetry add --group dev pytest\`, \`poetry remove\`, \`poetry install\` (installs from the lock file), \`poetry lock\`, \`poetry update requests\`, \`poetry run pytest\`, \`poetry show --tree\`, \`poetry build\`, \`poetry publish\`. It is mature and widely used in companies, especially for libraries and services created between 2019 and 2024.`,
      syntax: `poetry new salestool        # or: poetry init  (in an existing folder)
poetry add requests "django>=5,<6"
poetry add --group dev pytest mypy
poetry install              # create venv + install from poetry.lock
poetry run python -m salestool
poetry show --tree
poetry build && poetry publish
`,
    },
    {
      heading: "uv: The Fast All-in-One Tool",
      content: `**uv** (by Astral, the makers of Ruff) is written in Rust and is typically 10-100x faster than pip. It replaces several tools at once: pip, pip-tools, virtualenv, pyenv (installing Python versions), pipx (running CLI tools) and much of Poetry.

Project workflow: \`uv init\` creates pyproject.toml; \`uv add requests\` adds a dependency, updates the cross-platform **uv.lock** and syncs the \`.venv\`; \`uv add --dev pytest\` adds to the dev dependency group (PEP 735 \`[dependency-groups]\`); \`uv sync\` installs exactly what the lock says; \`uv run pytest\` runs a command inside the project environment (auto-syncing first); \`uv lock --upgrade-package requests\` updates one package; \`uv python install 3.12\` downloads a Python; \`uvx ruff check .\` runs a tool without installing it; \`uv build\` and \`uv publish\` handle packaging. For existing pip workflows there is a drop-in interface: \`uv venv\`, \`uv pip install -r requirements.txt\`, \`uv pip compile requirements.in -o requirements.txt\`.`,
      syntax: `curl -LsSf https://astral.sh/uv/install.sh | sh     # or: pip install uv
uv init salestool && cd salestool
uv add requests "django>=5,<6"
uv add --dev pytest
uv run pytest
uv sync --frozen        # CI: install exactly from uv.lock, fail if outdated
uv python install 3.13
uvx ruff check .
`,
    },
    {
      heading: "Choosing a Tool and Team Best Practices",
      content: "There is no single right answer - consistency inside a team matters most.",
      points: [
        "pip + venv + requirements.txt: simplest, fine for small scripts and learning",
        "pip-tools: minimal addition to pip, great for apps already using requirements files (Django/Flask deployments, Docker images)",
        "Poetry: mature all-in-one workflow, large ecosystem and documentation",
        "uv: fastest, manages Python versions too, rapidly becoming the default for new projects in 2025",
        "Always commit the lock file for applications; libraries publish flexible ranges",
        "Use the lock in CI (uv sync --frozen, poetry install --no-root / sync, pip-sync) so CI matches dev",
        "Automate updates with Dependabot/Renovate and run tests on every update; check for vulnerabilities with pip-audit",
      ],
    },
  ],
  examples: [
    {
      title: "Seeing Direct vs Transitive Dependencies",
      scenario: "A tech lead explains why 'requests' alone installs five packages, by walking a small dependency graph like a resolver does.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `graph = {
    "myapp": ["requests", "django"],
    "requests": ["urllib3", "idna", "certifi", "charset-normalizer"],
    "django": ["asgiref", "sqlparse"],
    "asgiref": [],
    "urllib3": [], "idna": [], "certifi": [], "charset-normalizer": [], "sqlparse": [],
}

def all_deps(pkg, seen=None, depth=0):
    seen = set() if seen is None else seen
    for dep in graph[pkg]:
        marker = "(already listed)" if dep in seen else ""
        print("    " * depth + f"└── {dep} {marker}".rstrip())
        if dep not in seen:
            seen.add(dep)
            all_deps(dep, seen, depth + 1)
    return seen

print("myapp")
deps = all_deps("myapp")
direct = set(graph["myapp"])
print(f"direct: {len(direct)}  transitive: {len(deps - direct)}  total: {len(deps)}")
print("transitive:", sorted(deps - direct))
`,
      python: {
        files: {
          "main.py": `graph = {
    "myapp": ["requests", "django"],
    "requests": ["urllib3", "idna", "certifi", "charset-normalizer"],
    "django": ["asgiref", "sqlparse"],
    "asgiref": [],
    "urllib3": [], "idna": [], "certifi": [], "charset-normalizer": [], "sqlparse": [],
}

def all_deps(pkg, seen=None, depth=0):
    seen = set() if seen is None else seen
    for dep in graph[pkg]:
        marker = "(already listed)" if dep in seen else ""
        print("    " * depth + f"└── {dep} {marker}".rstrip())
        if dep not in seen:
            seen.add(dep)
            all_deps(dep, seen, depth + 1)
    return seen

print("myapp")
deps = all_deps("myapp")
direct = set(graph["myapp"])
print(f"direct: {len(direct)}  transitive: {len(deps - direct)}  total: {len(deps)}")
print("transitive:", sorted(deps - direct))
`,
        },
      },
      result: `myapp
└── requests
    └── urllib3
    └── idna
    └── certifi
    └── charset-normalizer
└── django
    └── asgiref
    └── sqlparse
direct: 2  transitive: 6  total: 8
transitive: ['asgiref', 'certifi', 'charset-normalizer', 'idna', 'sqlparse', 'urllib3']`,
      explanation: "The app asks for 2 packages but needs 8 in total. Tools like `pip-compile`, `poetry show --tree` and `uv tree` print a similar tree. Pinning only the 2 direct packages leaves the other 6 free to change between installs.",
    },
    {
      title: "A Tiny Version Resolver and a Conflict",
      scenario: "Understand what a resolver does: pick the newest version that satisfies every constraint, and fail clearly when constraints contradict each other.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `available = {"urllib3": ["1.26.18", "2.0.7", "2.2.3"], "pydantic": ["1.10.13", "2.5.0", "2.9.2"]}

def v(s):
    return tuple(int(x) for x in s.split("."))

def matches(version, spec):
    op, target = spec[:2] if spec[:2] in (">=", "<=", "==") else spec[:1], spec.lstrip("<>=")
    ver, tgt = v(version), v(target)
    return {">=": ver >= tgt, "<=": ver <= tgt, "==": ver == tgt, "<": ver < tgt, ">": ver > tgt}[op]

def resolve(package, constraints):
    ok = [ver for ver in available[package] if all(matches(ver, c) for c in constraints)]
    if not ok:
        raise LookupError(f"No version of {package} satisfies {constraints}")
    return max(ok, key=v)

requirements = {
    "urllib3": [">=1.21.1", "<3"],
    "pydantic": [">=2.0"],
}
for pkg, cons in requirements.items():
    print(pkg, cons, "->", resolve(pkg, cons))

conflict = ["<2", ">=2.5"]
try:
    resolve("pydantic", conflict)
except LookupError as e:
    print("Conflict:", e)
`,
      python: {
        files: {
          "main.py": `available = {"urllib3": ["1.26.18", "2.0.7", "2.2.3"], "pydantic": ["1.10.13", "2.5.0", "2.9.2"]}

def v(s):
    return tuple(int(x) for x in s.split("."))

def matches(version, spec):
    op, target = spec[:2] if spec[:2] in (">=", "<=", "==") else spec[:1], spec.lstrip("<>=")
    ver, tgt = v(version), v(target)
    return {">=": ver >= tgt, "<=": ver <= tgt, "==": ver == tgt, "<": ver < tgt, ">": ver > tgt}[op]

def resolve(package, constraints):
    ok = [ver for ver in available[package] if all(matches(ver, c) for c in constraints)]
    if not ok:
        raise LookupError(f"No version of {package} satisfies {constraints}")
    return max(ok, key=v)

requirements = {
    "urllib3": [">=1.21.1", "<3"],
    "pydantic": [">=2.0"],
}
for pkg, cons in requirements.items():
    print(pkg, cons, "->", resolve(pkg, cons))

conflict = ["<2", ">=2.5"]
try:
    resolve("pydantic", conflict)
except LookupError as e:
    print("Conflict:", e)
`,
        },
      },
      result: `urllib3 ['>=1.21.1', '<3'] -> 2.2.3
pydantic ['>=2.0'] -> 2.9.2
Conflict: No version of pydantic satisfies ['<2', '>=2.5']`,
      explanation: "The resolver chooses the newest version satisfying all constraints (requests wants urllib3>=1.21.1,<3). When one library needs pydantic<2 and another needs >=2.5, no version works - real tools print a similar 'ResolutionImpossible' or 'version solving failed' error, and you must upgrade or replace one of the libraries.",
    },
    {
      title: "Reading a Pinned requirements.txt Produced by pip-compile",
      scenario: "A DevOps engineer audits a compiled requirements file: which packages are direct, which are pulled in by others, and are all of them pinned with hashes?",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `compiled = """
#
# This file is autogenerated by pip-compile with Python 3.12
# by the following command:
#
#    pip-compile --generate-hashes requirements.in
#
certifi==2024.8.30 \\\\
    --hash=sha256:aaaa
    # via requests
charset-normalizer==3.4.0 \\\\
    --hash=sha256:bbbb
    # via requests
django==5.1.4 \\\\
    --hash=sha256:cccc
    # via -r requirements.in
asgiref==3.8.1 \\\\
    --hash=sha256:dddd
    # via django
idna==3.10 \\\\
    --hash=sha256:eeee
    # via requests
requests==2.32.3 \\\\
    --hash=sha256:ffff
    # via -r requirements.in
"""

packages, current = {}, None
for line in compiled.splitlines():
    s = line.strip()
    if "==" in s and not s.startswith("#"):
        name, version = s.split(" ")[0].split("==")
        current = name
        packages[name] = {"version": version, "hash": False, "via": []}
    elif s.startswith("--hash=") and current:
        packages[current]["hash"] = True
    elif s.startswith("# via") and current:
        packages[current]["via"].append(s.removeprefix("# via").strip())

direct = sorted(n for n, p in packages.items() if "-r requirements.in" in p["via"])
print("Direct    :", direct)
for name, p in sorted(packages.items()):
    if name not in direct:
        print(f"Transitive: {name}=={p['version']} (needed by {', '.join(p['via'])})")
print("All pinned with hashes:", all(p["hash"] for p in packages.values()))
`,
      python: {
        files: {
          "main.py": `compiled = """
#
# This file is autogenerated by pip-compile with Python 3.12
# by the following command:
#
#    pip-compile --generate-hashes requirements.in
#
certifi==2024.8.30 \\\\
    --hash=sha256:aaaa
    # via requests
charset-normalizer==3.4.0 \\\\
    --hash=sha256:bbbb
    # via requests
django==5.1.4 \\\\
    --hash=sha256:cccc
    # via -r requirements.in
asgiref==3.8.1 \\\\
    --hash=sha256:dddd
    # via django
idna==3.10 \\\\
    --hash=sha256:eeee
    # via requests
requests==2.32.3 \\\\
    --hash=sha256:ffff
    # via -r requirements.in
"""

packages, current = {}, None
for line in compiled.splitlines():
    s = line.strip()
    if "==" in s and not s.startswith("#"):
        name, version = s.split(" ")[0].split("==")
        current = name
        packages[name] = {"version": version, "hash": False, "via": []}
    elif s.startswith("--hash=") and current:
        packages[current]["hash"] = True
    elif s.startswith("# via") and current:
        packages[current]["via"].append(s.removeprefix("# via").strip())

direct = sorted(n for n, p in packages.items() if "-r requirements.in" in p["via"])
print("Direct    :", direct)
for name, p in sorted(packages.items()):
    if name not in direct:
        print(f"Transitive: {name}=={p['version']} (needed by {', '.join(p['via'])})")
print("All pinned with hashes:", all(p["hash"] for p in packages.values()))
`,
        },
      },
      result: `Direct    : ['django', 'requests']
Transitive: asgiref==3.8.1 (needed by django)
Transitive: certifi==2024.8.30 (needed by requests)
Transitive: charset-normalizer==3.4.0 (needed by requests)
Transitive: idna==3.10 (needed by requests)
All pinned with hashes: True`,
      explanation: "pip-compile writes exact == pins, a '# via' comment for every package and, with --generate-hashes, a sha256 hash so pip refuses tampered downloads. Reading the 'via' comments tells you why a transitive package exists, which helps when deciding upgrades.",
    },
    {
      title: "Same Project with pip-tools, Poetry and uv",
      scenario: "Set up a Django API with requests and a dev dependency (pytest) using each tool. Run these in a terminal; output lines are abbreviated.",
      steps: [
        "Install the tool you want to try (pip install pip-tools / pipx install poetry / pip install uv)",
        "Run the commands for that tool in an empty project folder",
        "Open the generated lock file (requirements.txt, poetry.lock or uv.lock) and commit it to Git",
        "On another machine or in CI, install from the lock file only",
      ],
      code: `# ---------- pip-tools ----------
python -m venv .venv && source .venv/bin/activate
pip install pip-tools
printf "django>=5,<6\\nrequests\\n" > requirements.in
printf -- "-c requirements.txt\\npytest\\n" > dev-requirements.in
pip-compile requirements.in
pip-compile dev-requirements.in
pip-sync requirements.txt dev-requirements.txt

# ---------- Poetry ----------
poetry init --no-interaction
poetry add "django>=5,<6" requests
poetry add --group dev pytest
poetry install
poetry run pytest

# ---------- uv ----------
uv init --app
uv add "django>=5,<6" requests
uv add --dev pytest
uv run pytest
uv sync --frozen            # in CI
`,
      result: `pip-tools -> requirements.txt and dev-requirements.txt with == pins and "# via" comments
Poetry    -> pyproject.toml updated, poetry.lock created, venv managed by Poetry
uv        -> pyproject.toml updated ([project].dependencies + [dependency-groups].dev),
             uv.lock created, .venv created and synced`,
      explanation: "All three end with the same idea: human-edited, flexible requirements plus a machine-generated lock file. pip-tools keeps plain pip and requirements files; Poetry and uv manage pyproject.toml, the lock file and the virtual environment for you. `uv sync --frozen` fails in CI if the lock file is out of date instead of silently changing it.",
    },
    {
      title: "Comparing Two Lock Snapshots Before an Upgrade",
      scenario: "Before merging a dependency-update pull request, a developer lists what changed between the old and new lock files and flags major-version jumps.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `old_lock = {"django": "5.0.9", "requests": "2.31.0", "urllib3": "1.26.18", "pytest": "7.4.4", "idna": "3.7"}
new_lock = {"django": "5.1.4", "requests": "2.32.3", "urllib3": "2.2.3", "pytest": "8.3.4", "certifi": "2024.8.30"}

def major(v):
    return int(v.split(".")[0])

for name in sorted(old_lock.keys() | new_lock.keys()):
    old, new = old_lock.get(name), new_lock.get(name)
    if old == new:
        continue
    if old is None:
        print(f"+ {name} {new} (added)")
    elif new is None:
        print(f"- {name} {old} (removed)")
    else:
        flag = "  <-- MAJOR upgrade, read the changelog!" if major(new) > major(old) else ""
        print(f"~ {name} {old} -> {new}{flag}")
`,
      python: {
        files: {
          "main.py": `old_lock = {"django": "5.0.9", "requests": "2.31.0", "urllib3": "1.26.18", "pytest": "7.4.4", "idna": "3.7"}
new_lock = {"django": "5.1.4", "requests": "2.32.3", "urllib3": "2.2.3", "pytest": "8.3.4", "certifi": "2024.8.30"}

def major(v):
    return int(v.split(".")[0])

for name in sorted(old_lock.keys() | new_lock.keys()):
    old, new = old_lock.get(name), new_lock.get(name)
    if old == new:
        continue
    if old is None:
        print(f"+ {name} {new} (added)")
    elif new is None:
        print(f"- {name} {old} (removed)")
    else:
        flag = "  <-- MAJOR upgrade, read the changelog!" if major(new) > major(old) else ""
        print(f"~ {name} {old} -> {new}{flag}")
`,
        },
      },
      result: `+ certifi 2024.8.30 (added)
~ django 5.0.9 -> 5.1.4
- idna 3.7 (removed)
~ pytest 7.4.4 -> 8.3.4  <-- MAJOR upgrade, read the changelog!
~ requests 2.31.0 -> 2.32.3
~ urllib3 1.26.18 -> 2.2.3  <-- MAJOR upgrade, read the changelog!`,
      explanation: "Set union of the keys finds every package in either lock. Minor/patch changes are usually safe; major jumps (urllib3 1 -> 2, pytest 7 -> 8) may contain breaking changes, so read the release notes and run the full test suite before merging.",
    },
  ],
  interview: [
    {
      q: "What is the difference between direct and transitive dependencies?",
      a: "Direct dependencies are the packages your project explicitly requires. Transitive dependencies are the dependencies of those packages (and so on). Example: requests is direct; urllib3, idna, certifi and charset-normalizer are transitive.",
      level: "Easy",
    },
    {
      q: "Why do we need lock files?",
      a: "To make installs reproducible. A lock file records exact versions (and often hashes) of all direct and transitive packages, so every developer, CI run and production deployment installs the identical set. Without it, new upstream releases can silently change behaviour.",
      level: "Easy",
    },
    {
      q: "What is wrong with only using `pip freeze > requirements.txt`?",
      a: "It dumps everything installed in the environment - including packages installed by accident - without separating direct from transitive dependencies or explaining why each exists. Upgrading one package safely is hard, and it has no hashes. pip-tools, Poetry or uv manage this properly.",
      level: "Medium",
    },
    {
      q: "What do pip-compile and pip-sync do?",
      a: "pip-compile reads loose requirements (requirements.in or pyproject.toml), resolves the full dependency tree and writes a pinned requirements.txt with '# via' annotations (optionally hashes). pip-sync makes the active environment exactly match one or more compiled files, installing, upgrading and uninstalling as needed.",
      level: "Medium",
    },
    {
      q: "What does Poetry provide beyond pip?",
      a: "Dependency declaration in pyproject.toml, a resolver and poetry.lock, automatic virtual environment management, dependency groups (dev, docs), `poetry run`, building and publishing packages, and version management (`poetry version minor`).",
      level: "Medium",
    },
    {
      q: "What is uv and why is it popular?",
      a: "uv is a Rust-based Python package and project manager from Astral. It is extremely fast (parallel downloads, global cache, hard links), and it combines pip, pip-tools, virtualenv, pyenv and pipx features: managing Python versions, venvs, a universal cross-platform lock file (uv.lock), running scripts and tools (uvx), building and publishing.",
      level: "Medium",
    },
    {
      q: "What does a caret constraint like ^2.31 mean in Poetry?",
      a: "Allow updates that do not change the left-most non-zero digit: ^2.31 means >=2.31,<3.0. ^0.4.2 means >=0.4.2,<0.5.0. Tilde ~2.31 means >=2.31,<2.32. In the standard [project] table you write explicit ranges instead.",
      level: "Hard",
    },
    {
      q: "How should a library and an application handle dependency versions differently?",
      a: "A library declares broad compatible ranges in pyproject.toml so it can coexist with other libraries in users' environments, and generally does not ship a lock file to users. An application pins everything via a committed lock file for reproducible deployments.",
      level: "Hard",
    },
    {
      q: "What are dependency groups / dev dependencies?",
      a: "Sets of packages needed only for development (pytest, mypy, ruff) or docs, not at runtime. Poetry uses `[tool.poetry.group.dev.dependencies]` (poetry add --group dev), uv and pip use the standard PEP 735 `[dependency-groups]` table (uv add --dev). They are excluded from the published package's requirements.",
      level: "Medium",
    },
    {
      q: "How do you resolve a dependency conflict?",
      a: "Read the resolver error to see which packages demand incompatible versions, inspect the tree (pipdeptree, poetry show --tree, uv tree), then upgrade the package with the outdated constraint, loosen your own pins, find an alternative library, or (last resort) split into separate environments/services.",
      level: "Hard",
    },
    {
      q: "Why use --generate-hashes or hash-checking?",
      a: "Hashes make pip verify that every downloaded file matches the expected sha256. This protects against compromised mirrors, man-in-the-middle attacks or a package version being replaced, and guarantees the exact same artifacts are installed.",
      level: "Medium",
    },
    {
      q: "What should CI do with lock files?",
      a: "Install strictly from the lock (pip-sync, poetry install after `poetry check --lock`, uv sync --locked/--frozen) and fail if the lock is out of date with pyproject.toml, so CI tests exactly what will be deployed. Also run pip-audit or similar for known vulnerabilities.",
      level: "Medium",
    },
  ],
  practice: [
    {
      task: "Given a requirements.txt text, write a script that reports any line that is NOT pinned with == (ignoring comments, blank lines and -r/-c includes).",
      hint: "Loop over lines, skip those starting with '#' or '-', and check '==' in line.",
      solution: `text = """
# app deps
django==5.1.4
requests>=2.31
-r base.txt
celery
redis==5.2.1
"""
unpinned = [l.strip() for l in text.splitlines()
            if l.strip() and not l.strip().startswith(("#", "-")) and "==" not in l]
print("Unpinned:", unpinned)
`,
    },
    {
      task: "Write a function `caret_range(version)` that converts a Poetry caret constraint like '^2.31.0', '^0.4.2' or '^1.0' into an explicit range string like '>=2.31.0,<3.0.0'.",
      hint: "Find the first non-zero part; increment it and zero everything after.",
      solution: `def caret_range(spec):
    version = spec.lstrip("^")
    parts = [int(p) for p in version.split(".")]
    parts += [0] * (3 - len(parts))
    idx = next((i for i, p in enumerate(parts) if p != 0), len(parts) - 1)
    upper = parts[:idx] + [parts[idx] + 1] + [0] * (len(parts) - idx - 1)
    return f">={'.'.join(map(str, parts))},<{'.'.join(map(str, upper))}"

for s in ["^2.31.0", "^0.4.2", "^1.0", "^0.0.3"]:
    print(s, "->", caret_range(s))
`,
    },
    {
      task: "Given a dependency graph dict, find which direct dependency pulls in a given transitive package (e.g. who needs 'urllib3'?). Print the full path(s).",
      hint: "Use depth-first search keeping the current path.",
      solution: `graph = {
    "myapp": ["requests", "boto3"],
    "requests": ["urllib3", "idna"],
    "boto3": ["botocore"],
    "botocore": ["urllib3"],
    "urllib3": [], "idna": [],
}

def paths_to(target, node="myapp", path=None):
    path = (path or []) + [node]
    if node == target:
        return [path]
    found = []
    for dep in graph[node]:
        found += paths_to(target, dep, path)
    return found

for p in paths_to("urllib3"):
    print(" -> ".join(p))
`,
    },
    {
      task: "Write a cheat-sheet dictionary mapping tasks ('create venv', 'add package', 'add dev package', 'install from lock', 'run tests', 'update one package') to the pip-tools, Poetry and uv commands, and print it as an aligned table.",
      hint: "Use f-strings with fixed widths like {task:<22}.",
      solution: `sheet = {
    "create venv": ("python -m venv .venv", "poetry install", "uv venv"),
    "add package": ("edit requirements.in + pip-compile", "poetry add requests", "uv add requests"),
    "add dev package": ("edit dev-requirements.in", "poetry add --group dev pytest", "uv add --dev pytest"),
    "install from lock": ("pip-sync requirements.txt", "poetry install", "uv sync"),
    "run tests": ("pytest", "poetry run pytest", "uv run pytest"),
    "update one package": ("pip-compile -P requests", "poetry update requests", "uv lock -P requests"),
}
print(f"{'task':<20}{'pip-tools':<38}{'Poetry':<32}uv")
for task, (a, b, c) in sheet.items():
    print(f"{task:<20}{a:<38}{b:<32}{c}")
`,
    },
  ],
  quiz: [
    {
      question: "Which file does pip-compile generate from requirements.in?",
      options: [
        "poetry.lock",
        "A pinned requirements.txt",
        "uv.lock",
        "setup.py",
      ],
      answer: 1,
      explanation: "pip-compile resolves requirements.in into a fully pinned requirements.txt.",
    },
    {
      question: "What does pip-sync do that `pip install -r` does not?",
      options: [
        "Downloads faster",
        "Uninstalls packages not listed in the file",
        "Creates a lock file",
        "Publishes to PyPI",
      ],
      answer: 1,
      explanation: "pip-sync makes the environment match the file exactly, removing extras.",
    },
    {
      question: "Which command adds pytest as a development dependency with uv?",
      options: [
        "uv install pytest --dev",
        "uv add --dev pytest",
        "uv pip dev pytest",
        "uvx pytest --save",
      ],
      answer: 1,
      explanation: "uv add --dev adds to the dev dependency group and updates uv.lock.",
    },
    {
      question: "In Poetry, ^2.31 means...",
      options: [
        "Exactly 2.31",
        ">=2.31,<2.32",
        ">=2.31,<3.0",
        "Any version",
      ],
      answer: 2,
      explanation: "Caret allows changes that keep the left-most non-zero digit: <3.0.",
    },
    {
      question: "Should an application commit its lock file to Git?",
      options: [
        "No, it is generated",
        "Yes, for reproducible installs",
        "Only on Windows",
        "Only for libraries",
      ],
      answer: 1,
      explanation: "Committing the lock file lets every environment install the same versions.",
    },
    {
      question: "uvx ruff check . does what?",
      options: [
        "Installs ruff globally permanently",
        "Runs ruff in a temporary cached environment without adding it to the project",
        "Adds ruff to pyproject.toml",
        "Publishes ruff",
      ],
      answer: 1,
      explanation: "uvx (uv tool run) runs a CLI tool in an isolated, cached environment.",
    },
  ],
};
