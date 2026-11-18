export default {
  id: "extra-12-subprocess-env-vars-dotenv",
  title: "subprocess, Environment Variables and .env Configuration",
  module: "Module 2: Standard Library Power Tools",
  extraNo: 12,
  level: "Intermediate",
  duration: "2.5 hours",
  summary: "Run other programs from Python safely with subprocess.run (capturing output, checking exit codes, timeouts, avoiding shell injection), and manage configuration the 12-factor way using environment variables and .env files - reading them with os.environ, converting types, validating required settings and keeping secrets out of source code.",
  objectives: [
    "Run external commands with subprocess.run and capture stdout/stderr",
    "Handle exit codes, CalledProcessError and timeouts",
    "Explain why shell=True with user input is dangerous and how to avoid it",
    "Read, set and validate environment variables with os.environ",
    "Load settings from a .env file (python-dotenv or a simple parser) and keep secrets out of Git",
  ],
  theory: [
    {
      heading: "Running Commands with subprocess.run",
      content: `The \`subprocess\` module starts other programs (git, ffmpeg, pg_dump, another Python script) and talks to them. The recommended high-level API is \`subprocess.run()\`. Pass the command as a **list of arguments**: \`["git", "status", "--short"]\`. It waits for the process to finish and returns a \`CompletedProcess\` with \`args\`, \`returncode\`, \`stdout\` and \`stderr\`.

Important arguments: \`capture_output=True\` collects stdout and stderr instead of printing them; \`text=True\` decodes bytes to str; \`check=True\` raises \`CalledProcessError\` when the exit code is non-zero; \`timeout=seconds\` raises \`TimeoutExpired\`; \`cwd=\` sets the working directory; \`env=\` sets environment variables; \`input=\` sends data to stdin.`,
      syntax: `import subprocess
result = subprocess.run(["git", "status", "--short"],
                        capture_output=True, text=True, check=True, timeout=30)
print(result.returncode, result.stdout)
`,
    },
    {
      heading: "Errors, Exit Codes and Timeouts",
      content: "By default, run() does not raise when the command fails - you must check `result.returncode` (0 = success). With `check=True`, a non-zero code raises `subprocess.CalledProcessError`, whose `.returncode`, `.stdout` and `.stderr` help you log the problem. If the program is not installed you get `FileNotFoundError`. A hung process can block your app forever, so set `timeout` and catch `subprocess.TimeoutExpired` (run() kills the child for you).",
      points: [
        "`shutil.which('git')` checks whether a command exists on PATH",
        "Use `sys.executable` to run another Python script with the same interpreter",
        "`stderr=subprocess.STDOUT` merges errors into stdout",
        "`subprocess.DEVNULL` discards output",
      ],
    },
    {
      heading: "Security: Avoid shell=True with User Input",
      content: `\`shell=True\` runs the command through the system shell (\`/bin/sh\` or \`cmd.exe\`). This enables pipes and wildcards, but if any part of the command comes from users, an attacker can inject extra commands: a filename like \`report.txt; rm -rf ~\` would run both. This is **command injection**, a top security bug.

Safe pattern: pass a list without shell=True - each list item is one argument and is never interpreted by a shell. If you really need a shell string, quote untrusted parts with \`shlex.quote()\`. Do pipelines in Python (pass one process's output as the next one's input) instead of \`|\` in a shell.`,
      tip: "Interview favourite: 'Why is subprocess.run(f\"ping {host}\", shell=True) dangerous?' Answer: command injection. Use [\"ping\", \"-c\", \"1\", host].",
    },
    {
      heading: "Popen for Advanced Cases",
      content: "`subprocess.Popen` is the low-level class behind run(). Use it when you need to start a process and keep working while it runs, stream output line by line (e.g. showing build logs live), or connect processes together. Call `communicate()` to send input and read all output safely, `poll()` to check if it finished, `wait()` to block, and `terminate()`/`kill()` to stop it. For most scripts, run() is enough. For concurrent async programs, asyncio has `asyncio.create_subprocess_exec`.",
      syntax: `with subprocess.Popen(["ping", "-c", "3", "example.com"],
                      stdout=subprocess.PIPE, text=True) as proc:
    for line in proc.stdout:
        print("LIVE:", line.rstrip())
`,
    },
    {
      heading: "Environment Variables",
      content: `Environment variables are key-value strings given to every process by the operating system or the parent process (shell, Docker, CI, cloud platform). They are the standard way to configure apps per environment (development, staging, production) without changing code - one of the **12-factor app** principles.

In Python, \`os.environ\` is a dict-like mapping. \`os.environ["KEY"]\` raises KeyError if missing; \`os.environ.get("KEY", default)\` or \`os.getenv("KEY", default)\` returns a default. All values are **strings**, so convert types yourself (\`int(...)\`, and careful boolean parsing). Changes to \`os.environ\` affect the current process and child processes started afterwards, not the parent shell.`,
      syntax: `# Linux/macOS:  export DB_URL=postgres://...   |  Windows: set DB_URL=...
import os
db_url = os.environ["DB_URL"]                 # required
debug = os.getenv("DEBUG", "false").lower() in {"1", "true", "yes"}
port = int(os.getenv("PORT", "8000"))
`,
    },
    {
      heading: ".env Files and Secret Management",
      content: `During development it is tedious to export many variables. A \`.env\` file holds them as \`KEY=value\` lines in the project folder. The popular package **python-dotenv** loads it: \`from dotenv import load_dotenv; load_dotenv()\` - existing real environment variables win by default (override=False). Frameworks like Django (django-environ), FastAPI (pydantic-settings) and Flask support this pattern.

Rules for teams: add \`.env\` to \`.gitignore\` (never commit secrets), commit a \`.env.example\` with dummy values to document required keys, validate required settings at startup and fail fast with a clear message, and in production use the platform's secret manager (AWS Secrets Manager, Azure Key Vault, GitHub Actions secrets, Kubernetes secrets).`,
      points: [
        "pip install python-dotenv",
        ".env -> local only; .env.example -> committed",
        "Never print or log full secret values; mask them (sk-****1234)",
      ],
    },
  ],
  examples: [
    {
      title: "Running a Command and Capturing Output",
      scenario: "A build script runs another Python program, captures its output and checks the exit code. Using sys.executable makes it work on any OS.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import subprocess
import sys

result = subprocess.run(
    [sys.executable, "-c", "import sys; print('Hello from child'); print('warn', file=sys.stderr)"],
    capture_output=True, text=True,
)
print("returncode:", result.returncode)
print("stdout:", result.stdout.strip())
print("stderr:", result.stderr.strip())

fail = subprocess.run([sys.executable, "-c", "import sys; sys.exit(3)"])
print("failed returncode:", fail.returncode)

try:
    subprocess.run([sys.executable, "-c", "raise SystemExit('bad config')"],
                   capture_output=True, text=True, check=True)
except subprocess.CalledProcessError as e:
    print("CalledProcessError: code", e.returncode, "| stderr:", e.stderr.strip())

out = subprocess.run([sys.executable, "-c", "print(input().upper())"],
                     input="send me to stdin\\n", capture_output=True, text=True)
print("echo:", out.stdout.strip())
`,
      result: `returncode: 0
stdout: Hello from child
stderr: warn
failed returncode: 3
CalledProcessError: code 1 | stderr: bad config
echo: SEND ME TO STDIN`,
      explanation: "The command is a list, so no shell is involved. capture_output + text gives decoded strings. Without check=True a failure just sets returncode; with check=True it raises CalledProcessError carrying the captured stderr. input= feeds stdin. (subprocess does not work in the in-browser IDE, so run this locally.)",
    },
    {
      title: "Timeouts, Missing Programs and Command Injection",
      scenario: "A monitoring tool must not hang on a slow command, must handle missing tools and must never allow shell injection from a user-supplied filename.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import shlex
import shutil
import subprocess
import sys

try:
    subprocess.run([sys.executable, "-c", "import time; time.sleep(5)"], timeout=0.5)
except subprocess.TimeoutExpired as e:
    print("Timed out after", round(e.timeout, 1), "seconds")

try:
    subprocess.run(["surely-not-installed-tool", "--version"])
except FileNotFoundError:
    print("Tool not installed")
print("which python found:", shutil.which("python3") is not None or shutil.which("python") is not None)

user_file = "report.txt; echo HACKED"
unsafe_cmd = f"echo Processing {user_file}"
print("UNSAFE shell output:", subprocess.run(unsafe_cmd, shell=True, capture_output=True, text=True).stdout.split("\\n")[:2])

safe = subprocess.run([sys.executable, "-c", "import sys; print('Processing', sys.argv[1])", user_file],
                      capture_output=True, text=True)
print("SAFE list output:", safe.stdout.strip())
print("Quoted for shell:", shlex.quote(user_file))
print("Split a command line:", shlex.split('git commit -m "first commit"'))
`,
      result: `Timed out after 0.5 seconds
Tool not installed
which python found: True
UNSAFE shell output: ['Processing report.txt', 'HACKED']
SAFE list output: Processing report.txt; echo HACKED
Quoted for shell: 'report.txt; echo HACKED'
Split a command line: ['git', 'commit', '-m', 'first commit']`,
      explanation: "timeout kills a stuck child and raises TimeoutExpired. A missing executable raises FileNotFoundError. With shell=True, the '; echo HACKED' part ran as a second command - injection! Passing a list sends the whole string as one harmless argument. shlex.quote/split help when you must deal with shell syntax. (Run locally; shown output is from Linux.)",
    },
    {
      title: "Reading and Validating Environment Variables",
      scenario: "A web service reads its configuration from environment variables with types, defaults and a clear error for missing required values.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import os

os.environ["APP_ENV"] = "staging"
os.environ["PORT"] = "8080"
os.environ["DEBUG"] = "Yes"
os.environ["ALLOWED_HOSTS"] = "api.example.com, admin.example.com"
os.environ.pop("DATABASE_URL", None)

def env_bool(name, default=False):
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}

def env_list(name, default=""):
    return [item.strip() for item in os.getenv(name, default).split(",") if item.strip()]

config = {
    "env": os.getenv("APP_ENV", "development"),
    "port": int(os.getenv("PORT", "8000")),
    "debug": env_bool("DEBUG"),
    "hosts": env_list("ALLOWED_HOSTS"),
    "workers": int(os.getenv("WORKERS", "2")),
}
print(config)
print(type(os.environ["PORT"]).__name__, "->", type(config["port"]).__name__)

missing = [key for key in ("DATABASE_URL", "SECRET_KEY") if key not in os.environ]
if missing:
    print("Config error: missing required env vars:", ", ".join(missing))

try:
    os.environ["DATABASE_URL"]
except KeyError as e:
    print("KeyError for", e)
`,
      python: {
        files: {
          "main.py": `import os

os.environ["APP_ENV"] = "staging"
os.environ["PORT"] = "8080"
os.environ["DEBUG"] = "Yes"
os.environ["ALLOWED_HOSTS"] = "api.example.com, admin.example.com"
os.environ.pop("DATABASE_URL", None)

def env_bool(name, default=False):
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}

def env_list(name, default=""):
    return [item.strip() for item in os.getenv(name, default).split(",") if item.strip()]

config = {
    "env": os.getenv("APP_ENV", "development"),
    "port": int(os.getenv("PORT", "8000")),
    "debug": env_bool("DEBUG"),
    "hosts": env_list("ALLOWED_HOSTS"),
    "workers": int(os.getenv("WORKERS", "2")),
}
print(config)
print(type(os.environ["PORT"]).__name__, "->", type(config["port"]).__name__)

missing = [key for key in ("DATABASE_URL", "SECRET_KEY") if key not in os.environ]
if missing:
    print("Config error: missing required env vars:", ", ".join(missing))

try:
    os.environ["DATABASE_URL"]
except KeyError as e:
    print("KeyError for", e)
`,
        },
      },
      result: `{'env': 'staging', 'port': 8080, 'debug': True, 'hosts': ['api.example.com', 'admin.example.com'], 'workers': 2}
str -> int
Config error: missing required env vars: DATABASE_URL, SECRET_KEY
KeyError for 'DATABASE_URL'`,
      explanation: "Environment values are always strings, so we convert to int, bool and list explicitly. bool('false') would be True, which is why env_bool compares against accepted words. Checking required keys at startup gives one clear message instead of a crash deep inside the app.",
    },
    {
      title: "Loading a .env File (Without Extra Packages)",
      scenario: "To understand what python-dotenv does, we write a small .env loader, respecting comments, quotes and existing variables.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import os
from pathlib import Path

Path(".env").write_text("""
# Local development settings - DO NOT COMMIT
DATABASE_URL=postgres://dev:dev@localhost:5432/shop
SECRET_KEY="dev-secret-123"
DEBUG=true
PORT=5000   # inline comments are ignored
EMPTY=
""", encoding="utf-8")

def load_env(path=".env", override=False):
    loaded = {}
    for raw in Path(path).read_text(encoding="utf-8").splitlines():
        line = raw.split(" #", 1)[0].strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key, value = key.strip(), value.strip().strip('"').strip("'")
        if override or key not in os.environ:
            os.environ[key] = value
            loaded[key] = value
    return loaded

os.environ["PORT"] = "9000"
loaded = load_env()
print("Loaded keys:", list(loaded))
print("PORT stays from real env:", os.environ["PORT"])
print("DEBUG:", os.environ["DEBUG"], "| EMPTY:", repr(os.environ["EMPTY"]))

def mask(secret):
    return secret[:3] + "*" * (len(secret) - 6) + secret[-3:]
print("SECRET_KEY:", mask(os.environ["SECRET_KEY"]))
Path(".env").unlink()
`,
      python: {
        files: {
          "main.py": `import os
from pathlib import Path

Path(".env").write_text("""
# Local development settings - DO NOT COMMIT
DATABASE_URL=postgres://dev:dev@localhost:5432/shop
SECRET_KEY="dev-secret-123"
DEBUG=true
PORT=5000   # inline comments are ignored
EMPTY=
""", encoding="utf-8")

def load_env(path=".env", override=False):
    loaded = {}
    for raw in Path(path).read_text(encoding="utf-8").splitlines():
        line = raw.split(" #", 1)[0].strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key, value = key.strip(), value.strip().strip('"').strip("'")
        if override or key not in os.environ:
            os.environ[key] = value
            loaded[key] = value
    return loaded

os.environ["PORT"] = "9000"
loaded = load_env()
print("Loaded keys:", list(loaded))
print("PORT stays from real env:", os.environ["PORT"])
print("DEBUG:", os.environ["DEBUG"], "| EMPTY:", repr(os.environ["EMPTY"]))

def mask(secret):
    return secret[:3] + "*" * (len(secret) - 6) + secret[-3:]
print("SECRET_KEY:", mask(os.environ["SECRET_KEY"]))
Path(".env").unlink()
`,
        },
      },
      result: `Loaded keys: ['DATABASE_URL', 'SECRET_KEY', 'DEBUG', 'EMPTY']
PORT stays from real env: 9000
DEBUG: true | EMPTY: ''
SECRET_KEY: dev********123`,
      explanation: "The loader skips blanks and comments, splits on the first '=', strips quotes and does not override variables that already exist (the same default as python-dotenv's load_dotenv()). Secrets are masked before printing. In real projects just use `from dotenv import load_dotenv; load_dotenv()`.",
    },
    {
      title: "Passing a Custom Environment to a Child Process",
      scenario: "A test runner starts a worker script with a modified environment without changing the parent's environment.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import os
import subprocess
import sys

child_code = "import os; print(os.environ.get('APP_ENV'), os.environ.get('FEATURE_X', 'off'))"

os.environ["APP_ENV"] = "development"
print("parent :", os.environ["APP_ENV"])

child_env = {**os.environ, "APP_ENV": "test", "FEATURE_X": "on"}
out = subprocess.run([sys.executable, "-c", child_code], env=child_env, capture_output=True, text=True)
print("child  :", out.stdout.strip())
print("parent after:", os.environ["APP_ENV"], os.environ.get("FEATURE_X"))

inherited = subprocess.run([sys.executable, "-c", child_code], capture_output=True, text=True)
print("inherit:", inherited.stdout.strip())
`,
      result: `parent : development
child  : test on
parent after: development None
inherit: development off`,
      explanation: "env= replaces the child's environment completely, so we copy os.environ and override keys with {**os.environ, ...}. The parent's environment is unchanged. Without env=, the child inherits the parent's current environment. (Run locally.)",
    },
  ],
  interview: [
    {
      q: "What is the recommended way to run an external command in Python?",
      a: "`subprocess.run([...args], capture_output=True, text=True, check=True, timeout=...)`. It waits for completion and returns a CompletedProcess with returncode, stdout and stderr. os.system is older, gives no output capture and goes through the shell.",
      level: "Easy",
    },
    {
      q: "Why pass the command as a list instead of a string?",
      a: "With a list, each item is passed as one exact argument to the program, with no shell parsing. This avoids quoting bugs with spaces and prevents command injection. A string requires shell=True (or exact parsing) on POSIX.",
      level: "Medium",
    },
    {
      q: "What is command injection and how does shell=True cause it?",
      a: "If untrusted input is put into a shell command string, characters like ; | && $( ) let an attacker run extra commands. shell=True sends the string to /bin/sh or cmd.exe, which interprets them. Use an argument list without shell, or shlex.quote() untrusted parts.",
      level: "Hard",
    },
    {
      q: "What does check=True do?",
      a: "If the process exits with a non-zero code, subprocess.run raises CalledProcessError (containing returncode, cmd, stdout, stderr). Without it, you must check result.returncode manually.",
      level: "Easy",
    },
    {
      q: "How do you prevent a subprocess from hanging forever?",
      a: "Pass timeout=seconds. If exceeded, run() kills the child and raises subprocess.TimeoutExpired, which you can catch and log/retry.",
      level: "Medium",
    },
    {
      q: "What is the difference between subprocess.run and Popen?",
      a: "run is a convenience function that starts a process, waits for it and returns results. Popen is the lower-level class that starts a process and returns immediately, letting you stream output, interact with stdin, poll, or run several processes concurrently. run uses Popen internally.",
      level: "Medium",
    },
    {
      q: "Why might `communicate()` be preferred over reading proc.stdout and writing proc.stdin manually?",
      a: "If you write to stdin and read stdout/stderr manually, OS pipe buffers can fill up and both processes wait for each other (deadlock). communicate() handles the reading and writing safely until the process ends.",
      level: "Hard",
    },
    {
      q: "How do you read an environment variable with a default?",
      a: "`os.getenv('PORT', '8000')` or `os.environ.get('PORT', '8000')`. `os.environ['PORT']` raises KeyError if missing, which is good for required settings. Remember values are strings - convert with int() etc.",
      level: "Easy",
    },
    {
      q: "Why is bool(os.getenv('DEBUG')) a bug?",
      a: "Any non-empty string is truthy, so 'false', '0' and 'no' all become True. Parse explicitly: `os.getenv('DEBUG', '').lower() in {'1', 'true', 'yes', 'on'}`.",
      level: "Medium",
    },
    {
      q: "What is a .env file and should it be committed to Git?",
      a: "A local file with KEY=value lines loaded into environment variables during development (e.g. via python-dotenv). It often contains secrets, so it must be in .gitignore. Commit a .env.example with placeholder values instead.",
      level: "Easy",
    },
    {
      q: "Does changing os.environ affect the terminal that started Python?",
      a: "No. Each process has its own copy of the environment. Changes affect the current Python process and any child processes started afterwards, but never the parent shell.",
      level: "Medium",
    },
    {
      q: "Explain the 12-factor approach to configuration.",
      a: "Configuration that differs between deployments (database URLs, credentials, feature flags) is stored in environment variables, not in code. The same build artifact can then run in dev, staging and production with different settings, and secrets stay out of the repository.",
      level: "Medium",
    },
  ],
  practice: [
    {
      task: "Use subprocess.run with sys.executable to run `python -c \"print(sum(range(101)))\"`, capture the output and convert it to an int.",
      hint: "int(result.stdout.strip())",
      solution: `import subprocess
import sys

result = subprocess.run([sys.executable, "-c", "print(sum(range(101)))"],
                        capture_output=True, text=True, check=True)
total = int(result.stdout.strip())
print(total, type(total).__name__)
`,
    },
    {
      task: "Write `safe_run(cmd, timeout=5)` that returns (ok, output) and never raises: it handles FileNotFoundError, CalledProcessError and TimeoutExpired. Test it with a good command, a failing command and a missing program.",
      hint: "Wrap subprocess.run(..., check=True, capture_output=True, text=True, timeout=timeout) in try/except.",
      solution: `import subprocess
import sys

def safe_run(cmd, timeout=5):
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, check=True, timeout=timeout)
        return True, r.stdout.strip()
    except FileNotFoundError:
        return False, f"not found: {cmd[0]}"
    except subprocess.CalledProcessError as e:
        return False, f"exit {e.returncode}: {e.stderr.strip()}"
    except subprocess.TimeoutExpired:
        return False, "timeout"

print(safe_run([sys.executable, "-c", "print('ok')"]))
print(safe_run([sys.executable, "-c", "import sys; sys.exit('boom')"]))
print(safe_run(["no-such-binary"]))
`,
    },
    {
      task: "Write a `Settings` dataclass built from environment variables: APP_NAME (default 'shop'), PORT (int, default 8000), DEBUG (bool, default False) and API_KEY (required - raise RuntimeError if missing). Demonstrate with os.environ values set in the script.",
      hint: "Add a classmethod from_env(cls) that reads os.environ.",
      solution: `import os
from dataclasses import dataclass

@dataclass(frozen=True)
class Settings:
    app_name: str
    port: int
    debug: bool
    api_key: str

    @classmethod
    def from_env(cls):
        key = os.getenv("API_KEY")
        if not key:
            raise RuntimeError("API_KEY environment variable is required")
        return cls(
            app_name=os.getenv("APP_NAME", "shop"),
            port=int(os.getenv("PORT", "8000")),
            debug=os.getenv("DEBUG", "false").lower() in {"1", "true", "yes", "on"},
            api_key=key,
        )

os.environ.pop("API_KEY", None)
try:
    Settings.from_env()
except RuntimeError as e:
    print("Error:", e)

os.environ.update({"API_KEY": "abc123", "PORT": "9090", "DEBUG": "on"})
s = Settings.from_env()
print(s.app_name, s.port, s.debug)
`,
    },
    {
      task: "Given a .env.example text with keys DATABASE_URL, SECRET_KEY, REDIS_URL and a .env text containing only DATABASE_URL and SECRET_KEY, print which keys are missing from .env.",
      hint: "Parse keys from each text with line.split('=', 1)[0] and use set difference.",
      solution: `example = """DATABASE_URL=postgres://user:pass@host/db
SECRET_KEY=change-me
REDIS_URL=redis://localhost:6379
"""
actual = """DATABASE_URL=postgres://dev@localhost/shop
SECRET_KEY=dev
"""

def keys(text):
    return {line.split("=", 1)[0].strip() for line in text.splitlines()
            if line.strip() and not line.startswith("#") and "=" in line}

missing = keys(example) - keys(actual)
print("Missing keys:", sorted(missing))
`,
    },
  ],
  quiz: [
    {
      question: "Which call safely runs `git log -n 5`?",
      options: [
        "subprocess.run('git log -n 5')",
        "subprocess.run(['git', 'log', '-n', '5'])",
        "os.system(['git', 'log'])",
        "subprocess.call('git' + 'log')",
      ],
      answer: 1,
      explanation: "A list of arguments runs without a shell and with exact arguments.",
    },
    {
      question: "What does text=True do in subprocess.run?",
      options: [
        "Prints output",
        "Decodes stdout/stderr to str instead of bytes",
        "Enables the shell",
        "Captures output",
      ],
      answer: 1,
      explanation: "text=True (alias universal_newlines) returns strings instead of bytes.",
    },
    {
      question: "With check=True, a command exiting with code 1 causes...",
      options: [
        "returncode = 1 only",
        "CalledProcessError",
        "TimeoutExpired",
        "FileNotFoundError",
      ],
      answer: 1,
      explanation: "check=True raises CalledProcessError for non-zero exit codes.",
    },
    {
      question: "What type are values in os.environ?",
      options: [
        "Any Python type",
        "Always str",
        "int or str",
        "bytes",
      ],
      answer: 1,
      explanation: "Environment variables are always strings.",
    },
    {
      question: "Which file should be committed to Git?",
      options: [
        ".env",
        ".env.example",
        "Both",
        "Neither",
      ],
      answer: 1,
      explanation: ".env holds real secrets; .env.example documents required keys with dummy values.",
    },
    {
      question: "Main risk of shell=True with user input?",
      options: [
        "Slower execution",
        "Command injection",
        "Unicode errors",
        "Zombie processes",
      ],
      answer: 1,
      explanation: "The shell interprets special characters, letting attackers run extra commands.",
    },
  ],
};
