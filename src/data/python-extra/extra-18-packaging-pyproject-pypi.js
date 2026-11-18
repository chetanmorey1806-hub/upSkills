export default {
  id: "extra-18-packaging-pyproject-pypi",
  title: "Project Packaging with pyproject.toml and Publishing to PyPI",
  module: "Module 4: Packaging & Ecosystem",
  extraNo: 18,
  level: "Advanced",
  duration: "3 hours",
  summary: "Turn your code into an installable, shareable Python package. Learn the src layout, modules vs packages, the pyproject.toml file (build-system, [project] metadata, dependencies, optional extras, console-script entry points), build backends (setuptools, hatchling), building wheels and sdists with python -m build, semantic versioning, testing on TestPyPI and publishing to PyPI with twine or trusted publishing.",
  objectives: [
    "Organise code into a package using the src layout",
    "Write a complete pyproject.toml with metadata, dependencies, extras and entry points",
    "Explain build backends, wheels and source distributions",
    "Build, check and upload a package to TestPyPI and PyPI",
    "Version packages with semantic versioning and read versions with importlib.metadata",
  ],
  theory: [
    {
      heading: "Modules, Packages and Distributions",
      content: `A **module** is a single .py file. A **package** is a folder of modules, usually with an \`__init__.py\` file (which runs when the package is imported and can expose a public API). A **distribution package** is what you install with pip - an archive (wheel or sdist) that contains one or more import packages plus metadata like name, version and dependencies.

Note: the install name and import name can differ: \`pip install scikit-learn\` but \`import sklearn\`; \`pip install python-dotenv\` but \`import dotenv\`. **PyPI** (pypi.org, the Python Package Index) is the public repository from which pip downloads packages.`,
      points: [
        "Module: utils.py",
        "Package: mypkg/ with __init__.py, core.py, cli.py",
        "Distribution: mypkg-1.0.0-py3-none-any.whl uploaded to PyPI",
      ],
    },
    {
      heading: "The src Layout",
      content: "The recommended project structure puts the package inside a `src/` folder. This prevents a common bug: with a flat layout, tests may import your local folder instead of the installed package, hiding packaging mistakes (e.g. missing files). With src layout you must install the package (`pip install -e .` for development) before importing it, so tests check what users will actually get.",
      syntax: `salestool/                    <- project root (Git repo)
├── pyproject.toml            <- build + project config
├── README.md
├── LICENSE
├── src/
│   └── salestool/            <- import package
│       ├── __init__.py
│       ├── core.py
│       ├── cli.py
│       └── py.typed          <- marks the package as type-hinted
└── tests/
    └── test_core.py
`,
    },
    {
      heading: "pyproject.toml: The Single Configuration File",
      content: `PEP 518, 517 and 621 standardised \`pyproject.toml\` as the one place for packaging configuration, replacing setup.py and setup.cfg for most projects.

The **[build-system]** table tells pip which **build backend** builds your package (setuptools, hatchling, flit-core, pdm-backend, poetry-core). The **[project]** table holds standard metadata: name, version, description, readme, requires-python, license, authors, classifiers, \`dependencies\` (runtime requirements with version specifiers) and \`[project.optional-dependencies]\` (extras like \`pip install salestool[excel]\`). **[project.scripts]** creates command-line commands. **[tool.*]** tables configure tools like pytest, mypy, ruff and black.`,
      syntax: `[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "salestool"
version = "0.1.0"
description = "Sales reports from CSV files"
readme = "README.md"
requires-python = ">=3.10"
license = "MIT"
authors = [{ name = "Asha Patil", email = "asha@example.com" }]
dependencies = ["requests>=2.31,<3", "rich>=13"]

[project.optional-dependencies]
excel = ["openpyxl>=3.1"]
dev = ["pytest>=8", "mypy", "ruff"]

[project.scripts]
salestool = "salestool.cli:main"

[project.urls]
Homepage = "https://github.com/example/salestool"
`,
    },
    {
      heading: "Wheels, sdists and Building",
      content: `There are two distribution formats. A **wheel** (\`.whl\`) is a pre-built archive that pip can install by just unpacking - fast and no build step. A pure-Python wheel is tagged \`py3-none-any\` (works everywhere); packages with C extensions need platform-specific wheels. A **source distribution** (sdist, \`.tar.gz\`) contains the source and pyproject.toml; pip must build it on the user's machine.

Build both with the standard frontend: \`pip install build\` then \`python -m build\`, which creates \`dist/salestool-0.1.0-py3-none-any.whl\` and \`dist/salestool-0.1.0.tar.gz\` in an isolated environment. During development, \`pip install -e .\` (editable install) links the installed package to your source so changes apply without reinstalling.`,
    },
    {
      heading: "Versioning and Dependency Specifiers",
      content: `Use **semantic versioning** MAJOR.MINOR.PATCH: increment PATCH for bug fixes, MINOR for backward-compatible features, MAJOR for breaking changes. PEP 440 defines valid versions (1.2.0, 2.0.0rc1, 1.0.0.dev3, 1.0.post1). A version can't be re-uploaded to PyPI once published - even after deleting it - so bump the version for every release.

Dependency specifiers: \`>=2.31\` minimum, \`<3\` upper bound, \`~=1.4.2\` compatible release (>=1.4.2, <1.5), \`==1.4.*\` wildcard, \`!=1.5.0\` exclusion, and environment markers like \`tomli>=2; python_version < '3.11'\`. Libraries should use **flexible ranges** (to avoid conflicts for users); applications pin exact versions in lock files (next lesson).`,
      tip: "Read your installed version at runtime with `importlib.metadata.version('salestool')` instead of hard-coding __version__ in two places.",
    },
    {
      heading: "Publishing to TestPyPI and PyPI",
      content: `Steps: (1) create accounts on test.pypi.org and pypi.org and enable 2FA, (2) create an API token, (3) build with \`python -m build\`, (4) check with \`twine check dist/*\` (validates README rendering and metadata), (5) upload to TestPyPI first: \`twine upload --repository testpypi dist/*\`, (6) test install: \`pip install -i https://test.pypi.org/simple/ salestool\`, (7) upload to PyPI: \`twine upload dist/*\`.

The modern, more secure method is **Trusted Publishing**: configure PyPI to trust your GitHub Actions workflow (OIDC), then the \`pypa/gh-action-pypi-publish\` action uploads on each tagged release - no long-lived tokens stored anywhere. Also check the package name is free on PyPI before you start, and include a LICENSE and a good README (it becomes the PyPI project page).`,
      points: [
        "pip install build twine",
        "python -m build",
        "twine check dist/*",
        "twine upload --repository testpypi dist/*",
        "twine upload dist/*",
      ],
    },
  ],
  examples: [
    {
      title: "Generating a src-layout Project Skeleton",
      scenario: "A developer writes a script that creates the folder structure and starter files for a new package, then prints the tree.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `from pathlib import Path
import shutil

def create_project(name: str, root: Path = Path(".")) -> Path:
    base = root / name
    pkg = base / "src" / name.replace("-", "_")
    for folder in (pkg, base / "tests"):
        folder.mkdir(parents=True, exist_ok=True)
    files = {
        base / "README.md": f"# {name}\\n\\nSales reports from CSV files.\\n",
        base / "LICENSE": "MIT License\\n",
        base / ".gitignore": "dist/\\n*.egg-info/\\n__pycache__/\\n.venv/\\n",
        pkg / "__init__.py": '"""Sales tool package."""\\nfrom .core import total_sales\\n\\n__all__ = ["total_sales"]\\n',
        pkg / "core.py": "def total_sales(rows):\\n    return sum(r['amount'] for r in rows)\\n",
        pkg / "cli.py": "def main():\\n    print('salestool OK')\\n    return 0\\n",
        pkg / "py.typed": "",
        base / "tests" / "test_core.py": "from salestool import total_sales\\n\\ndef test_total():\\n    assert total_sales([{'amount': 5}]) == 5\\n",
    }
    for path, text in files.items():
        path.write_text(text, encoding="utf-8")
    return base

def tree(path: Path, prefix: str = "") -> None:
    entries = sorted(path.iterdir(), key=lambda p: (p.is_file(), p.name))
    for i, entry in enumerate(entries):
        last = i == len(entries) - 1
        print(prefix + ("└── " if last else "├── ") + entry.name + ("/" if entry.is_dir() else ""))
        if entry.is_dir():
            tree(entry, prefix + ("    " if last else "│   "))

project = create_project("salestool")
print("salestool/")
tree(project)
shutil.rmtree(project)
`,
      python: {
        files: {
          "main.py": `from pathlib import Path
import shutil

def create_project(name: str, root: Path = Path(".")) -> Path:
    base = root / name
    pkg = base / "src" / name.replace("-", "_")
    for folder in (pkg, base / "tests"):
        folder.mkdir(parents=True, exist_ok=True)
    files = {
        base / "README.md": f"# {name}\\n\\nSales reports from CSV files.\\n",
        base / "LICENSE": "MIT License\\n",
        base / ".gitignore": "dist/\\n*.egg-info/\\n__pycache__/\\n.venv/\\n",
        pkg / "__init__.py": '"""Sales tool package."""\\nfrom .core import total_sales\\n\\n__all__ = ["total_sales"]\\n',
        pkg / "core.py": "def total_sales(rows):\\n    return sum(r['amount'] for r in rows)\\n",
        pkg / "cli.py": "def main():\\n    print('salestool OK')\\n    return 0\\n",
        pkg / "py.typed": "",
        base / "tests" / "test_core.py": "from salestool import total_sales\\n\\ndef test_total():\\n    assert total_sales([{'amount': 5}]) == 5\\n",
    }
    for path, text in files.items():
        path.write_text(text, encoding="utf-8")
    return base

def tree(path: Path, prefix: str = "") -> None:
    entries = sorted(path.iterdir(), key=lambda p: (p.is_file(), p.name))
    for i, entry in enumerate(entries):
        last = i == len(entries) - 1
        print(prefix + ("└── " if last else "├── ") + entry.name + ("/" if entry.is_dir() else ""))
        if entry.is_dir():
            tree(entry, prefix + ("    " if last else "│   "))

project = create_project("salestool")
print("salestool/")
tree(project)
shutil.rmtree(project)
`,
        },
      },
      result: `salestool/
├── src/
│   └── salestool/
│       ├── __init__.py
│       ├── cli.py
│       ├── core.py
│       └── py.typed
├── tests/
│   └── test_core.py
├── .gitignore
├── LICENSE
└── README.md`,
      explanation: "The package lives in src/salestool, tests live outside it, and metadata files sit at the root. __init__.py re-exports total_sales so users can write `from salestool import total_sales`. py.typed tells type checkers the package ships type hints. (pyproject.toml is added in the next example.)",
    },
    {
      title: "Validating a pyproject.toml with tomllib",
      scenario: "Before releasing, a CI script checks that pyproject.toml has the required metadata and a valid version and entry point.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import re
import tomllib

PYPROJECT = """
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "salestool"
version = "1.4.0"
description = "Sales reports from CSV files"
readme = "README.md"
requires-python = ">=3.10"
license = "MIT"
dependencies = ["requests>=2.31,<3", "rich>=13", "tomli>=2; python_version < '3.11'"]

[project.optional-dependencies]
excel = ["openpyxl>=3.1"]
dev = ["pytest>=8", "mypy"]

[project.scripts]
salestool = "salestool.cli:main"
"""

data = tomllib.loads(PYPROJECT)
project = data["project"]
problems = []
for key in ("name", "version", "description", "requires-python", "readme"):
    if key not in project:
        problems.append(f"missing [project].{key}")
if not re.fullmatch(r"\\d+\\.\\d+\\.\\d+((a|b|rc)\\d+)?", project["version"]):
    problems.append("version is not MAJOR.MINOR.PATCH")
for cmd, target in project.get("scripts", {}).items():
    if ":" not in target:
        problems.append(f"script {cmd} must look like module:function")

print("backend :", data["build-system"]["build-backend"])
print("package :", project["name"], project["version"])
print("deps    :", [re.split(r"[<>=!~;\\s]", d)[0] for d in project["dependencies"]])
print("extras  :", {k: len(v) for k, v in project["optional-dependencies"].items()})
print("commands:", project["scripts"])
print("OK" if not problems else problems)
`,
      python: {
        files: {
          "main.py": `import re
import tomllib

PYPROJECT = """
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "salestool"
version = "1.4.0"
description = "Sales reports from CSV files"
readme = "README.md"
requires-python = ">=3.10"
license = "MIT"
dependencies = ["requests>=2.31,<3", "rich>=13", "tomli>=2; python_version < '3.11'"]

[project.optional-dependencies]
excel = ["openpyxl>=3.1"]
dev = ["pytest>=8", "mypy"]

[project.scripts]
salestool = "salestool.cli:main"
"""

data = tomllib.loads(PYPROJECT)
project = data["project"]
problems = []
for key in ("name", "version", "description", "requires-python", "readme"):
    if key not in project:
        problems.append(f"missing [project].{key}")
if not re.fullmatch(r"\\d+\\.\\d+\\.\\d+((a|b|rc)\\d+)?", project["version"]):
    problems.append("version is not MAJOR.MINOR.PATCH")
for cmd, target in project.get("scripts", {}).items():
    if ":" not in target:
        problems.append(f"script {cmd} must look like module:function")

print("backend :", data["build-system"]["build-backend"])
print("package :", project["name"], project["version"])
print("deps    :", [re.split(r"[<>=!~;\\s]", d)[0] for d in project["dependencies"]])
print("extras  :", {k: len(v) for k, v in project["optional-dependencies"].items()})
print("commands:", project["scripts"])
print("OK" if not problems else problems)
`,
        },
      },
      result: `backend : hatchling.build
package : salestool 1.4.0
deps    : ['requests', 'rich', 'tomli']
extras  : {'excel': 1, 'dev': 2}
commands: {'salestool': 'salestool.cli:main'}
OK`,
      explanation: "tomllib parses the file into dicts. The script checks required [project] fields, validates the version format and the module:function form of entry points. The dependency list shows version ranges and an environment marker (tomli only needed before 3.11).",
    },
    {
      title: "Reading Installed Package Metadata",
      scenario: "An app wants to show its own version and check which optional libraries are installed, without hard-coding versions.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import sys
from importlib import metadata

def installed_version(dist_name: str) -> str:
    try:
        return metadata.version(dist_name)
    except metadata.PackageNotFoundError:
        return "not installed"

print("Python:", sys.version_info[:2] >= (3, 10))
print("salestool:", installed_version("salestool"))
print("surely-missing-pkg:", installed_version("surely-missing-pkg-xyz"))

def parse(v: str) -> tuple[int, ...]:
    return tuple(int(p) for p in v.split(".")[:3])

def satisfies(version: str, minimum: str, below: str) -> bool:
    return parse(minimum) <= parse(version) < parse(below)

for v in ["2.30.0", "2.31.0", "2.32.3", "3.0.0"]:
    print(f"requests {v} satisfies >=2.31,<3 ?", satisfies(v, "2.31.0", "3.0.0"))

def bump(version: str, part: str) -> str:
    major, minor, patch = parse(version)
    if part == "major":
        return f"{major + 1}.0.0"
    if part == "minor":
        return f"{major}.{minor + 1}.0"
    return f"{major}.{minor}.{patch + 1}"

print("bug fix  :", bump("1.4.2", "patch"))
print("feature  :", bump("1.4.2", "minor"))
print("breaking :", bump("1.4.2", "major"))
`,
      python: {
        files: {
          "main.py": `import sys
from importlib import metadata

def installed_version(dist_name: str) -> str:
    try:
        return metadata.version(dist_name)
    except metadata.PackageNotFoundError:
        return "not installed"

print("Python:", sys.version_info[:2] >= (3, 10))
print("salestool:", installed_version("salestool"))
print("surely-missing-pkg:", installed_version("surely-missing-pkg-xyz"))

def parse(v: str) -> tuple[int, ...]:
    return tuple(int(p) for p in v.split(".")[:3])

def satisfies(version: str, minimum: str, below: str) -> bool:
    return parse(minimum) <= parse(version) < parse(below)

for v in ["2.30.0", "2.31.0", "2.32.3", "3.0.0"]:
    print(f"requests {v} satisfies >=2.31,<3 ?", satisfies(v, "2.31.0", "3.0.0"))

def bump(version: str, part: str) -> str:
    major, minor, patch = parse(version)
    if part == "major":
        return f"{major + 1}.0.0"
    if part == "minor":
        return f"{major}.{minor + 1}.0"
    return f"{major}.{minor}.{patch + 1}"

print("bug fix  :", bump("1.4.2", "patch"))
print("feature  :", bump("1.4.2", "minor"))
print("breaking :", bump("1.4.2", "major"))
`,
        },
      },
      result: `Python: True
salestool: not installed
surely-missing-pkg: not installed
requests 2.30.0 satisfies >=2.31,<3 ? False
requests 2.31.0 satisfies >=2.31,<3 ? True
requests 2.32.3 satisfies >=2.31,<3 ? True
requests 3.0.0 satisfies >=2.31,<3 ? False
bug fix  : 1.4.3
feature  : 1.5.0
breaking : 2.0.0`,
      explanation: "importlib.metadata reads the metadata of installed distributions; PackageNotFoundError means it is not installed. The tuple comparison shows how version ranges work (real tools use packaging.version, which also handles rc/dev/post versions). bump follows semantic versioning rules.",
    },
    {
      title: "Build, Check and Publish Commands",
      scenario: "The release checklist for salestool 1.4.0, run in a terminal from the project root. Output is trimmed to the important lines.",
      steps: [
        "Activate your virtual environment in the project root",
        "Run each command one by one in the terminal (not in the in-browser IDE)",
        "Upload to TestPyPI first and test-install it in a fresh virtual environment",
        "Only then upload to the real PyPI",
      ],
      code: `# 1. tools
python -m pip install --upgrade build twine

# 2. editable install for development + run tests
pip install -e ".[dev]"
pytest -q

# 3. build sdist and wheel (isolated build env)
python -m build

# 4. validate metadata / README rendering
twine check dist/*

# 5. upload to TestPyPI, then test-install
twine upload --repository testpypi dist/*
pip install -i https://test.pypi.org/simple/ salestool==1.4.0

# 6. real release + git tag
twine upload dist/*
git tag v1.4.0 && git push --tags
`,
      result: `Successfully built salestool-1.4.0.tar.gz and salestool-1.4.0-py3-none-any.whl
Checking dist/salestool-1.4.0-py3-none-any.whl: PASSED
Checking dist/salestool-1.4.0.tar.gz: PASSED
Uploading distributions to https://test.pypi.org/legacy/
Uploading salestool-1.4.0-py3-none-any.whl
Uploading salestool-1.4.0.tar.gz
View at:
https://test.pypi.org/project/salestool/1.4.0/`,
      explanation: "python -m build creates both distribution formats in dist/. twine check catches broken README markup or metadata before upload. TestPyPI is a separate sandbox index, so mistakes there do not burn a version number on the real PyPI. twine asks for credentials: use username __token__ and an API token, or set up Trusted Publishing in GitHub Actions instead.",
    },
    {
      title: "How Entry Points and __init__.py Work",
      scenario: "Simulate what pip does for [project.scripts]: import the package from src/ and call the configured module:function.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import importlib
import shutil
import sys
from pathlib import Path

pkg = Path("demo_src/salestool")
pkg.mkdir(parents=True, exist_ok=True)
(pkg / "__init__.py").write_text(
    "__version__ = '1.4.0'\\n"
    "from .core import total_sales\\n"
    "__all__ = ['total_sales']\\n"
    "print('salestool package imported')\\n"
)
(pkg / "core.py").write_text("def total_sales(rows):\\n    return sum(r['amount'] for r in rows)\\n")
(pkg / "cli.py").write_text(
    "import sys\\n"
    "from salestool import total_sales, __version__\\n"
    "def main(argv=None):\\n"
    "    argv = sys.argv[1:] if argv is None else argv\\n"
    "    rows = [{'amount': float(a)} for a in argv]\\n"
    "    print(f'salestool {__version__}: total = {total_sales(rows)}')\\n"
    "    return 0\\n"
)

sys.path.insert(0, "demo_src")

entry_point = "salestool.cli:main"
module_name, func_name = entry_point.split(":")
main = getattr(importlib.import_module(module_name), func_name)
exit_code = main(["100", "250.5", "49.5"])
print("exit code:", exit_code)

import salestool
print(salestool.__version__, salestool.__all__, "salestool.core" in sys.modules)
shutil.rmtree("demo_src")
`,
      python: {
        files: {
          "main.py": `import importlib
import shutil
import sys
from pathlib import Path

pkg = Path("demo_src/salestool")
pkg.mkdir(parents=True, exist_ok=True)
(pkg / "__init__.py").write_text(
    "__version__ = '1.4.0'\\n"
    "from .core import total_sales\\n"
    "__all__ = ['total_sales']\\n"
    "print('salestool package imported')\\n"
)
(pkg / "core.py").write_text("def total_sales(rows):\\n    return sum(r['amount'] for r in rows)\\n")
(pkg / "cli.py").write_text(
    "import sys\\n"
    "from salestool import total_sales, __version__\\n"
    "def main(argv=None):\\n"
    "    argv = sys.argv[1:] if argv is None else argv\\n"
    "    rows = [{'amount': float(a)} for a in argv]\\n"
    "    print(f'salestool {__version__}: total = {total_sales(rows)}')\\n"
    "    return 0\\n"
)

sys.path.insert(0, "demo_src")

entry_point = "salestool.cli:main"
module_name, func_name = entry_point.split(":")
main = getattr(importlib.import_module(module_name), func_name)
exit_code = main(["100", "250.5", "49.5"])
print("exit code:", exit_code)

import salestool
print(salestool.__version__, salestool.__all__, "salestool.core" in sys.modules)
shutil.rmtree("demo_src")
`,
        },
      },
      result: `salestool package imported
salestool 1.4.0: total = 400.0
exit code: 0
1.4.0 ['total_sales'] True`,
      explanation: "Importing salestool.cli first runs salestool/__init__.py once (the print shows it), which re-exports total_sales. pip's generated `salestool` command does exactly this: import the module from the entry point string and call the function, passing its return value to sys.exit.",
    },
  ],
  interview: [
    {
      q: "What is the difference between a module, a package and a distribution?",
      a: "A module is one .py file. A package is a directory of modules (with __init__.py) importable as a namespace. A distribution is the installable archive (wheel/sdist) with metadata, published to PyPI and installed by pip; it may contain several packages.",
      level: "Easy",
    },
    {
      q: "What is pyproject.toml?",
      a: "The standard configuration file for Python projects (PEPs 518/517/621). [build-system] declares the build backend and its requirements, [project] declares metadata and dependencies, and [tool.x] sections configure tools like pytest, mypy, ruff, black, hatch or poetry.",
      level: "Easy",
    },
    {
      q: "What is a build backend? Name some.",
      a: "The library that actually turns your source into wheels and sdists, called by frontends like pip or `python -m build` via the PEP 517 interface. Examples: setuptools.build_meta, hatchling.build, flit_core.buildapi, pdm.backend, poetry.core.masonry.api, maturin (Rust), scikit-build-core (C/C++).",
      level: "Medium",
    },
    {
      q: "What is the difference between a wheel and an sdist?",
      a: "A wheel (.whl) is a built distribution - installation just copies files, no build step, so it's fast and reliable. An sdist (.tar.gz) is a source distribution that must be built on the installing machine (may need compilers). Publish both: wheels for speed, sdist as fallback and for redistributors.",
      level: "Medium",
    },
    {
      q: "Why use the src layout?",
      a: "It forces you to install the package before testing, so tests run against the installed version and catch packaging errors (missing modules/data files). In flat layout, the current directory is on sys.path and tests may accidentally import the source folder directly.",
      level: "Medium",
    },
    {
      q: "What does `pip install -e .` do?",
      a: "Editable (development) install: the package is registered in the environment but points to your source directory, so code changes take effect without reinstalling. Dependencies and entry points are installed normally. Defined by PEP 660 for pyproject-based projects.",
      level: "Easy",
    },
    {
      q: "How do you create a command-line command for your package?",
      a: "Add `[project.scripts] mycmd = \"mypkg.cli:main\"` in pyproject.toml. On installation, pip generates a `mycmd` executable (mycmd.exe on Windows) that imports mypkg.cli and calls main(), using its return value as the exit code.",
      level: "Medium",
    },
    {
      q: "What are optional dependencies (extras)?",
      a: "Groups of extra requirements declared in [project.optional-dependencies], e.g. excel = ['openpyxl']. Users opt in with `pip install mypkg[excel]`. They keep the core install small while offering features that need heavy libraries; also used for dev/test groups.",
      level: "Medium",
    },
    {
      q: "Explain semantic versioning.",
      a: "MAJOR.MINOR.PATCH: increment MAJOR for incompatible API changes, MINOR for backward-compatible new features, PATCH for backward-compatible bug fixes. Pre-releases look like 2.0.0rc1 in PEP 440. It lets users choose safe version ranges like >=1.4,<2.",
      level: "Easy",
    },
    {
      q: "Why should libraries avoid pinning exact dependency versions?",
      a: "If library A pins requests==2.31.0 and library B pins requests==2.32.0, users cannot install both (resolution conflict). Libraries should declare the widest compatible range; applications pin exact versions in lock files for reproducible deployments.",
      level: "Hard",
    },
    {
      q: "What is TestPyPI and why use it?",
      a: "A separate instance of PyPI for testing releases. You can practise uploading and installing without affecting the real index. Because a version number can never be reused on PyPI (even after deletion), testing first avoids wasting versions on broken uploads.",
      level: "Medium",
    },
    {
      q: "What is Trusted Publishing?",
      a: "A PyPI feature using OpenID Connect: you configure PyPI to trust a specific CI workflow (e.g. GitHub Actions in your repo). The workflow gets a short-lived token automatically during the release job, so no long-lived API tokens need to be stored as secrets.",
      level: "Hard",
    },
  ],
  practice: [
    {
      task: "Write a complete pyproject.toml (as a Python string) for a package `invoicegen` using setuptools, requiring Python >=3.11, depending on jinja2>=3.1, with an optional extra `pdf = ['weasyprint']` and a command `invoicegen = invoicegen.cli:run`. Parse it with tomllib and print the name, dependencies and scripts.",
      hint: "[build-system] requires = ['setuptools>=68'], build-backend = 'setuptools.build_meta'",
      solution: `import tomllib

text = """
[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.build_meta"

[project]
name = "invoicegen"
version = "0.1.0"
description = "Generate invoices from templates"
readme = "README.md"
requires-python = ">=3.11"
dependencies = ["jinja2>=3.1"]

[project.optional-dependencies]
pdf = ["weasyprint"]

[project.scripts]
invoicegen = "invoicegen.cli:run"
"""
p = tomllib.loads(text)["project"]
print(p["name"], p["dependencies"], p["scripts"], p["optional-dependencies"])
`,
    },
    {
      task: "Write `wheel_name(name, version)` that returns the file name of a pure-Python wheel, e.g. wheel_name('sales-tool', '1.0.0') -> 'sales_tool-1.0.0-py3-none-any.whl' (dashes in the name become underscores).",
      hint: "Normalise with re.sub(r'[-_.]+', '_', name).lower().",
      solution: `import re

def wheel_name(name: str, version: str) -> str:
    normalized = re.sub(r"[-_.]+", "_", name).lower()
    return f"{normalized}-{version}-py3-none-any.whl"

print(wheel_name("sales-tool", "1.0.0"))
print(wheel_name("My.Package", "2.3.1"))
`,
    },
    {
      task: "Given a list of releases ['1.2.0', '1.10.0', '1.9.3', '2.0.0', '1.10.1'], print them sorted correctly by version (not alphabetically) and print the latest 1.x release.",
      hint: "Sort with key=lambda v: tuple(map(int, v.split('.'))).",
      solution: `releases = ["1.2.0", "1.10.0", "1.9.3", "2.0.0", "1.10.1"]
key = lambda v: tuple(map(int, v.split(".")))
ordered = sorted(releases, key=key)
print(ordered)
print("Alphabetical (wrong):", sorted(releases))
print("Latest 1.x:", max((v for v in releases if v.startswith("1.")), key=key))
`,
    },
    {
      task: "Write a release checklist function that takes a dict of facts (has_license, tests_passed, version_bumped, readme_renders) and prints which steps are missing before `twine upload` is allowed.",
      hint: "Loop over the dict items and collect False values.",
      solution: `def ready_to_publish(facts: dict[str, bool]) -> bool:
    missing = [name for name, ok in facts.items() if not ok]
    for m in missing:
        print("missing:", m)
    print("READY" if not missing else "NOT READY")
    return not missing

ready_to_publish({"has_license": True, "tests_passed": True, "version_bumped": False, "readme_renders": True})
`,
    },
  ],
  quiz: [
    {
      question: "Which table in pyproject.toml tells pip how to build the package?",
      options: [
        "[project]",
        "[build-system]",
        "[tool.pip]",
        "[project.scripts]",
      ],
      answer: 1,
      explanation: "[build-system] lists build requirements and the build-backend.",
    },
    {
      question: "A file named salestool-1.0.0-py3-none-any.whl is...",
      options: [
        "A source distribution",
        "A pure-Python wheel",
        "A Windows installer",
        "A lock file",
      ],
      answer: 1,
      explanation: "py3-none-any means any Python 3, no ABI, any platform.",
    },
    {
      question: "Which command builds both sdist and wheel?",
      options: [
        "pip build",
        "python setup.py upload",
        "python -m build",
        "twine build",
      ],
      answer: 2,
      explanation: "The build package is the standard PEP 517 build frontend.",
    },
    {
      question: "What does [project.scripts] create?",
      options: [
        "Test scripts",
        "Command-line executables that call a function",
        "Shell aliases",
        "GitHub Actions",
      ],
      answer: 1,
      explanation: "Entry points generate console commands on install.",
    },
    {
      question: "Under semantic versioning, a breaking API change from 2.4.1 should be released as...",
      options: [
        "2.4.2",
        "2.5.0",
        "3.0.0",
        "2.4.1.1",
      ],
      answer: 2,
      explanation: "Breaking changes increment MAJOR and reset MINOR and PATCH.",
    },
    {
      question: "Why test on TestPyPI first?",
      options: [
        "It is faster",
        "PyPI version numbers cannot be reused after upload",
        "PyPI requires it",
        "It removes the need for a README",
      ],
      answer: 1,
      explanation: "Once a version is uploaded to PyPI it can never be uploaded again, even if deleted.",
    },
  ],
};
