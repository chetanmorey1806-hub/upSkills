export default {
  id: "day-08-scheduling-and-logging",
  title: "Scheduling and Logging: schedule, cron, Task Scheduler and Retries",
  module: "Module 3: Bots & Scheduling",
  day: 8,
  level: "Advanced",
  duration: "3 hours",
  summary: "Make automation run by itself and make it trustworthy. Schedule scripts with the schedule library, Linux cron and Windows Task Scheduler, write proper logs to files with rotation, and add retries with exponential backoff so temporary failures do not break your bots.",
  objectives: [
    "Choose between in-process schedulers (schedule, APScheduler) and OS schedulers (cron, Task Scheduler)",
    "Write cron expressions and create Windows scheduled tasks for Python scripts",
    "Configure the logging module with levels, formats, file handlers and rotation",
    "Implement retries with exponential backoff and a reusable retry decorator",
    "Design scheduled jobs that are idempotent, observable and safe to re-run",
  ],
  theory: [
    {
      heading: "Two Ways to Schedule a Python Script",
      content: "**Option 1: a long-running Python process** that contains its own timer, using the `schedule` library (simple) or `APScheduler` (advanced: cron triggers, persistence). The script must keep running, so it needs a server or a PC that stays on.\n\n**Option 2: the operating system's scheduler**: cron on Linux/macOS or Task Scheduler on Windows starts your script at the right time; the script runs once and exits. This is more robust: if the script crashes, the next run still happens, and there is no process to babysit.",
      points: [
        "Daily report at 9 AM on a server: cron / Task Scheduler",
        "Check a website every 30 seconds while a program runs: schedule or APScheduler",
        "Cloud options: GitHub Actions schedules, AWS EventBridge + Lambda, Azure Functions timer trigger",
      ],
      tip: "Rule of thumb: let the OS do the scheduling and keep the Python script a simple 'run once and exit' job.",
    },
    {
      heading: "The schedule Library",
      content: "Install with `pip install schedule`. You register jobs with a readable syntax and then run a loop that calls `schedule.run_pending()` every second. Jobs run in the same thread one after another, so a slow job delays others. Time is the local time of the machine (newer versions also accept a timezone string in `.at()`).",
      syntax: `import time
import schedule

def job():
    print("Generating report...")

schedule.every(10).minutes.do(job)
schedule.every().day.at("09:00").do(job)
schedule.every().monday.at("08:30").do(job)
schedule.every().hour.at(":15").do(job)       # at minute 15 of every hour

while True:
    schedule.run_pending()
    time.sleep(1)
`,
    },
    {
      heading: "cron on Linux and macOS",
      content: "cron reads a table of jobs (`crontab -e` to edit, `crontab -l` to list). Each line has five time fields followed by the command. cron runs with a minimal environment: always use **absolute paths** to Python (preferably the virtual environment's python) and to the script, `cd` into the project folder, and redirect output to a log file.",
      syntax: `# ┌ minute (0-59)  ┌ hour (0-23)  ┌ day of month (1-31)  ┌ month (1-12)  ┌ day of week (0-6, Sun=0)
# m  h  dom mon dow  command
0  9  *   *   1-5  cd /home/asha/bots && /home/asha/bots/.venv/bin/python report.py >> logs/cron.log 2>&1
*/15 * *  *   *    /home/asha/bots/.venv/bin/python /home/asha/bots/check_site.py
30 18 1   *   *    /home/asha/bots/.venv/bin/python /home/asha/bots/monthly.py
`,
      points: [
        "0 9 * * 1-5  = 9:00 AM Monday to Friday",
        "*/15 * * * * = every 15 minutes",
        "30 18 1 * *  = 6:30 PM on the 1st of every month",
        "2>&1 sends errors (stderr) to the same log as normal output",
        "Use crontab.guru to check expressions",
      ],
    },
    {
      heading: "Windows Task Scheduler",
      content: "Open Task Scheduler > Create Task. On **Triggers** choose Daily at 09:00. On **Actions** choose Start a program: Program = full path to python.exe (or pythonw.exe to run without a console window), Arguments = full path to the script, **Start in** = the project folder (very important, otherwise relative paths fail). Under General, select 'Run whether user is logged on or not' for unattended jobs. You can also create the task from the command line with `schtasks`.",
      syntax: `schtasks /Create /TN "DailySalesReport" /SC DAILY /ST 09:00 ^
  /TR "C:\\bots\\.venv\\Scripts\\python.exe C:\\bots\\report.py"

schtasks /Run /TN "DailySalesReport"     :: run now to test
schtasks /Query /TN "DailySalesReport"
`,
      tip: "Inside the script, build paths relative to the script file: BASE = Path(__file__).resolve().parent. Then the job works no matter which folder it is started from.",
    },
    {
      heading: "Logging Instead of print()",
      content: "A scheduled job runs when nobody is watching, so print() output is lost. The `logging` module writes timestamped messages with severity levels to the console and to files. Levels from low to high: DEBUG, INFO, WARNING, ERROR, CRITICAL; a logger only outputs messages at or above its level. `logger.exception()` logs an ERROR with the full traceback. Use `RotatingFileHandler` (by size) or `TimedRotatingFileHandler` (daily) so log files do not grow forever.",
      syntax: `import logging
from logging.handlers import RotatingFileHandler

logger = logging.getLogger("sales_bot")
logger.setLevel(logging.INFO)
fmt = logging.Formatter("%(asctime)s | %(levelname)-8s | %(name)s | %(message)s")

file_handler = RotatingFileHandler("bot.log", maxBytes=1_000_000, backupCount=5, encoding="utf-8")
file_handler.setFormatter(fmt)
console = logging.StreamHandler()
console.setFormatter(fmt)
logger.addHandler(file_handler)
logger.addHandler(console)

logger.info("Report started")
try:
    1 / 0
except ZeroDivisionError:
    logger.exception("Report failed")      # includes traceback
`,
      tip: "For quick scripts, logging.basicConfig(filename='bot.log', level=logging.INFO, format=...) configures the root logger in one line. Never log passwords or tokens.",
    },
    {
      heading: "Retries, Backoff and Reliable Jobs",
      content: "Networks fail, servers return 503, files are locked. A good bot retries **temporary** errors a few times with growing waits (exponential backoff: 1s, 2s, 4s, ...) plus a little random jitter, and fails fast on **permanent** errors (wrong password, 404). After the last attempt it logs the error and sends an alert. The `tenacity` library provides ready-made retry decorators, but writing a small one yourself is a classic interview task.",
      points: [
        "Idempotent jobs: re-running must not duplicate data or emails (keep a 'last processed' marker)",
        "Use a lock file to stop two copies running at the same time",
        "Exit with a non-zero code on failure (sys.exit(1)) so cron/Task Scheduler can detect it",
        "Send an alert (Day 7) on failure, and optionally a heartbeat on success",
      ],
    },
  ],
  examples: [
    {
      title: "Logging to Console and a File",
      scenario: "A bot must record what it did in bot.log so that you can check tomorrow what happened at 9 AM today. (The format here omits the timestamp so the output is identical every run; in real bots add %(asctime)s.)",
      steps: [
        "No pip install needed (logging is built in)",
        "Run: python main.py",
        "Open bot.log to see the same messages saved in the file",
      ],
      code: `import logging
from pathlib import Path

logger = logging.getLogger("sales_bot")
logger.setLevel(logging.INFO)
fmt = logging.Formatter("%(levelname)-8s | %(name)s | %(message)s")

file_handler = logging.FileHandler("bot.log", mode="w", encoding="utf-8")
file_handler.setFormatter(fmt)
console = logging.StreamHandler()
console.setFormatter(fmt)
logger.addHandler(file_handler)
logger.addHandler(console)

orders = [1200, 850, -40, 3100]
logger.info("Job started with %d orders", len(orders))
logger.debug("This DEBUG line is hidden because the level is INFO")
for amount in orders:
    if amount < 0:
        logger.warning("Skipping invalid amount %s", amount)
        continue
total = sum(a for a in orders if a >= 0)
logger.info("Total revenue: Rs %s", f"{total:,}")
try:
    avg = total / 0
except ZeroDivisionError:
    logger.error("Could not compute average: no working days")
logger.info("Job finished")

file_handler.close()
print("Lines in bot.log:", len(Path("bot.log").read_text(encoding="utf-8").splitlines()))
`,
      result: `INFO     | sales_bot | Job started with 4 orders
WARNING  | sales_bot | Skipping invalid amount -40
INFO     | sales_bot | Total revenue: Rs 5,150
ERROR    | sales_bot | Could not compute average: no working days
INFO     | sales_bot | Job finished
Lines in bot.log: 5`,
      explanation: "We create a named logger with two handlers: one writes to bot.log, one to the console, both with the same format. The DEBUG message is filtered out because the logger level is INFO. Passing values as arguments (logger.info('...%d', n)) is preferred over f-strings because formatting happens only if the message is actually logged. Log messages go to stderr by default, while the final print goes to stdout.",
      python: {
        files: {
          "main.py": `import logging
from pathlib import Path

logger = logging.getLogger("sales_bot")
logger.setLevel(logging.INFO)
fmt = logging.Formatter("%(levelname)-8s | %(name)s | %(message)s")

file_handler = logging.FileHandler("bot.log", mode="w", encoding="utf-8")
file_handler.setFormatter(fmt)
console = logging.StreamHandler()
console.setFormatter(fmt)
logger.addHandler(file_handler)
logger.addHandler(console)

orders = [1200, 850, -40, 3100]
logger.info("Job started with %d orders", len(orders))
logger.debug("This DEBUG line is hidden because the level is INFO")
for amount in orders:
    if amount < 0:
        logger.warning("Skipping invalid amount %s", amount)
        continue
total = sum(a for a in orders if a >= 0)
logger.info("Total revenue: Rs %s", f"{total:,}")
try:
    avg = total / 0
except ZeroDivisionError:
    logger.error("Could not compute average: no working days")
logger.info("Job finished")

file_handler.close()
print("Lines in bot.log:", len(Path("bot.log").read_text(encoding="utf-8").splitlines()))
`,
        },
      },
    },
    {
      title: "A Reusable Retry Decorator with Exponential Backoff",
      scenario: "An upload function fails twice with a temporary error before succeeding. Another function fails with a permanent error that must not be retried. The delays are tiny so the demo runs fast.",
      steps: [
        "No pip install needed",
        "Run: python main.py",
        "In real code use base_delay=1 or more; for production consider pip install tenacity",
      ],
      code: `import time
import random
import functools

class TemporaryError(Exception):
    pass

def retry(times=3, base_delay=0.01, retry_on=(TemporaryError,)):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(1, times + 1):
                try:
                    return func(*args, **kwargs)
                except retry_on as e:
                    if attempt == times:
                        print(f"  giving up after {times} attempts")
                        raise
                    delay = base_delay * 2 ** (attempt - 1) + random.uniform(0, base_delay)
                    print(f"  attempt {attempt} failed ({e}); retrying")
                    time.sleep(delay)
        return wrapper
    return decorator

calls = {"n": 0}

@retry(times=4)
def upload_report():
    calls["n"] += 1
    if calls["n"] < 3:
        raise TemporaryError("503 Service Unavailable")
    return "uploaded"

@retry(times=4)
def login():
    raise PermissionError("wrong password")

print("upload:", upload_report(), "after", calls["n"], "calls")
try:
    login()
except PermissionError as e:
    print("login failed immediately:", e)
`,
      result: `  attempt 1 failed (503 Service Unavailable); retrying
  attempt 2 failed (503 Service Unavailable); retrying
upload: uploaded after 3 calls
login failed immediately: wrong password`,
      explanation: "retry() is a decorator factory: it takes settings and returns the real decorator. The wrapper calls the function up to 'times' times, but only catches the exception types in retry_on, so PermissionError (a permanent problem) is raised at once without retrying. The delay doubles each attempt (exponential backoff) with random jitter so many clients do not retry at the same moment. functools.wraps keeps the original function name and docstring.",
      python: {
        files: {
          "main.py": `import time
import random
import functools

class TemporaryError(Exception):
    pass

def retry(times=3, base_delay=0.01, retry_on=(TemporaryError,)):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(1, times + 1):
                try:
                    return func(*args, **kwargs)
                except retry_on as e:
                    if attempt == times:
                        print(f"  giving up after {times} attempts")
                        raise
                    delay = base_delay * 2 ** (attempt - 1) + random.uniform(0, base_delay)
                    print(f"  attempt {attempt} failed ({e}); retrying")
                    time.sleep(delay)
        return wrapper
    return decorator

calls = {"n": 0}

@retry(times=4)
def upload_report():
    calls["n"] += 1
    if calls["n"] < 3:
        raise TemporaryError("503 Service Unavailable")
    return "uploaded"

@retry(times=4)
def login():
    raise PermissionError("wrong password")

print("upload:", upload_report(), "after", calls["n"], "calls")
try:
    login()
except PermissionError as e:
    print("login failed immediately:", e)
`,
        },
      },
    },
    {
      title: "Run Jobs with the schedule Library",
      scenario: "While a support PC is on, check a website every 5 minutes and generate a summary every weekday at 18:00.",
      steps: [
        "Install: pip install schedule requests",
        "Run: python main.py and leave the terminal open (Ctrl+C to stop)",
        "Use cron or Task Scheduler instead if the job must survive reboots",
      ],
      code: `import time
import logging
import requests
import schedule

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s",
                    handlers=[logging.FileHandler("monitor.log"), logging.StreamHandler()])

def check_site():
    try:
        r = requests.get("https://example.com", timeout=10)
        logging.info("Site status %s in %.2fs", r.status_code, r.elapsed.total_seconds())
    except requests.RequestException as e:
        logging.error("Site DOWN: %s", e)

def daily_summary():
    logging.info("Generating daily summary...")

schedule.every(5).minutes.do(check_site)
for day in ("monday", "tuesday", "wednesday", "thursday", "friday"):
    getattr(schedule.every(), day).at("18:00").do(daily_summary)

check_site()                         # run once immediately
logging.info("Scheduler started with %d jobs", len(schedule.get_jobs()))
try:
    while True:
        schedule.run_pending()
        time.sleep(1)
except KeyboardInterrupt:
    logging.info("Stopped by user")
`,
      result: `2025-11-18 10:00:00,412 INFO Site status 200 in 0.31s
2025-11-18 10:00:00,413 INFO Scheduler started with 6 jobs
2025-11-18 10:05:00,925 INFO Site status 200 in 0.28s
... (continues every 5 minutes; timestamps will differ)`,
      explanation: "Each job is registered once; run_pending() executes only jobs whose time has come. getattr(schedule.every(), 'monday') is a neat way to register the same job for several weekdays. Exceptions inside check_site are caught so one network error does not kill the scheduler loop. KeyboardInterrupt is handled for a clean stop.",
    },
    {
      title: "Production-Ready Job Script for cron / Task Scheduler",
      scenario: "Write the 'run once' script that the OS scheduler starts every morning: it uses paths relative to the script, rotating logs, a lock file to prevent double runs and a proper exit code.",
      steps: [
        "No pip install needed",
        "Save as daily_job.py in your project folder and test it: python daily_job.py",
        "Linux: crontab -e and add: 0 9 * * 1-5 /full/path/.venv/bin/python /full/path/daily_job.py",
        "Windows: schtasks /Create /TN DailyJob /SC DAILY /ST 09:00 /TR \"C:\\bots\\.venv\\Scripts\\python.exe C:\\bots\\daily_job.py\"",
      ],
      code: `import sys
import logging
from pathlib import Path
from logging.handlers import TimedRotatingFileHandler

BASE = Path(__file__).resolve().parent
LOG_DIR = BASE / "logs"
LOG_DIR.mkdir(exist_ok=True)
LOCK = BASE / "daily_job.lock"

handler = TimedRotatingFileHandler(LOG_DIR / "daily_job.log", when="midnight", backupCount=14, encoding="utf-8")
handler.setFormatter(logging.Formatter("%(asctime)s | %(levelname)s | %(message)s"))
log = logging.getLogger("daily_job")
log.setLevel(logging.INFO)
log.addHandler(handler)

def main():
    log.info("Job started")
    # 1. read data  2. build report  3. send email  (see Day 10)
    log.info("Job finished successfully")

if __name__ == "__main__":
    try:
        LOCK.touch(exist_ok=False)          # fails if another run is active
    except FileExistsError:
        log.warning("Previous run still active; exiting")
        sys.exit(0)
    try:
        main()
    except Exception:
        log.exception("Job failed")
        sys.exit(1)
    finally:
        LOCK.unlink(missing_ok=True)
`,
      result: `(no console output; logs/daily_job.log contains)
2025-11-18 09:00:01,102 | INFO | Job started
2025-11-18 09:00:03,877 | INFO | Job finished successfully`,
      explanation: "Path(__file__).resolve().parent makes every path independent of the folder cron or Task Scheduler starts in. TimedRotatingFileHandler starts a new log file every midnight and keeps 14 days. touch(exist_ok=False) creates the lock atomically and fails if it already exists, preventing overlapping runs. log.exception records the traceback and sys.exit(1) signals failure to the scheduler; finally always removes the lock.",
    },
  ],
  interview: [
    { q: "How would you run a Python script every day at 9 AM?", a: "On Linux/macOS add a cron entry like `0 9 * * * /path/.venv/bin/python /path/script.py >> /path/log.txt 2>&1`. On Windows create a Task Scheduler task with a Daily trigger, python.exe as the program, the script as argument and the project folder as 'Start in'. Alternatively use schedule/APScheduler inside a long-running process, or cloud schedulers.", level: "Easy" },
    { q: "Explain the cron expression */10 8-18 * * 1-5.", a: "Every 10 minutes, from 08:00 to 18:50, Monday to Friday. Fields are minute, hour, day of month, month, day of week.", level: "Medium" },
    { q: "My script works manually but fails under cron. Why?", a: "cron uses a minimal environment: different PATH, no virtualenv activated, different working directory and no environment variables from your shell profile. Use absolute paths to the venv's python and to files, cd into the project, set needed env vars in the crontab or a .env file, and redirect output to a log to see errors.", level: "Medium" },
    { q: "What are the logging levels and their order?", a: "DEBUG (10) < INFO (20) < WARNING (30) < ERROR (40) < CRITICAL (50). A logger or handler set to a level outputs messages of that level and higher. The default root level is WARNING.", level: "Easy" },
    { q: "Why is logging better than print() in automation?", a: "Logging adds timestamps, levels and the source, can write to files, rotate them, send to multiple destinations (console, file, email, monitoring tools), can be filtered by level without code changes, and logger.exception() captures tracebacks. print() output is lost for unattended jobs.", level: "Easy" },
    { q: "Difference between RotatingFileHandler and TimedRotatingFileHandler?", a: "RotatingFileHandler rotates when the file reaches maxBytes and keeps backupCount old files. TimedRotatingFileHandler rotates on a time interval (e.g. when='midnight') and keeps backupCount old files.", level: "Medium" },
    { q: "What is exponential backoff and why add jitter?", a: "Backoff increases the wait between retries exponentially (1, 2, 4, 8 s) to give the failing service time to recover. Jitter adds randomness so that many clients failing at the same time do not all retry at the same instant (thundering herd).", level: "Medium" },
    { q: "Which errors should be retried and which not?", a: "Retry transient errors: timeouts, connection resets, HTTP 429/500/502/503/504, locked files. Do not retry permanent errors: 400, 401, 403, 404, validation errors, wrong credentials, or non-idempotent operations unless they are protected by an idempotency key.", level: "Hard" },
    { q: "How do you prevent a scheduled job from running twice at the same time?", a: "Use a lock: create a lock file atomically (open with 'x' mode / touch(exist_ok=False)) and remove it in finally, or use OS-level locks (fcntl.flock), a database row lock, or a scheduler option like APScheduler's max_instances=1 or Task Scheduler's 'Do not start a new instance'. Handle stale locks after crashes, e.g. by storing the PID and time.", level: "Hard" },
    { q: "schedule library vs APScheduler vs cron?", a: "schedule: tiny, readable, in-process, single-threaded, no persistence. APScheduler: in-process with cron/interval/date triggers, thread pools, job stores (DB persistence), misfire handling. cron/Task Scheduler: OS-level, survives reboots and crashes, best for 'run once and exit' scripts.", level: "Medium" },
    { q: "How would you know if your nightly job silently stopped running?", a: "Monitoring: send a success heartbeat to a service (e.g. healthchecks.io) or a Slack message, alert when it does not arrive; check log freshness; exit codes captured by the scheduler; and alert on failures via email/Telegram.", level: "Hard" },
    { q: "What does 2>&1 mean in a cron command?", a: "It redirects file descriptor 2 (stderr) to the same place as file descriptor 1 (stdout), so both normal output and error messages/tracebacks go into the same log file.", level: "Medium" },
  ],
  practice: [
    {
      task: "Write cron expressions for: (a) every Monday at 7:30 AM, (b) every 2 hours, (c) at 23:00 on the 28th of every month.",
      hint: "Fields: minute hour day-of-month month day-of-week.",
      solution: `(a) 30 7 * * 1
(b) 0 */2 * * *
(c) 0 23 28 * *
`,
    },
    {
      task: "Configure logging with basicConfig so that INFO and above go to app.log with the format 'time - level - message', then log one info and one error.",
      hint: "logging.basicConfig(filename=..., level=..., format=...).",
      solution: `import logging

logging.basicConfig(filename="app.log", level=logging.INFO,
                    format="%(asctime)s - %(levelname)s - %(message)s", encoding="utf-8")
logging.info("Application started")
logging.error("Could not connect to database")
`,
    },
    {
      task: "Write a function retry_call(func, attempts=3, delay=1) (not a decorator) that calls func(), retries on any Exception with doubling delay, and re-raises after the last attempt.",
      hint: "for i in range(attempts): try: return func() except Exception: ...",
      solution: `import time

def retry_call(func, attempts=3, delay=1):
    for i in range(attempts):
        try:
            return func()
        except Exception as e:
            if i == attempts - 1:
                raise
            print(f"Attempt {i + 1} failed: {e}; waiting {delay}s")
            time.sleep(delay)
            delay *= 2
`,
    },
    {
      task: "Use the schedule library to print 'Drink water' every 30 minutes and 'Stand up' every hour, and stop the loop after 8 hours.",
      hint: "Record the start time with time.monotonic() and break when 8 * 3600 seconds have passed.",
      solution: `import time
import schedule

schedule.every(30).minutes.do(lambda: print("Drink water"))
schedule.every().hour.do(lambda: print("Stand up"))

start = time.monotonic()
while time.monotonic() - start < 8 * 3600:
    schedule.run_pending()
    time.sleep(1)
schedule.clear()
`,
    },
  ],
  quiz: [
    { question: "What does the cron expression 0 9 * * 1-5 mean?", options: ["Every 9 minutes", "9:00 AM Monday to Friday", "9:00 AM on days 1 to 5 of each month", "Midnight on the 9th"], answer: 1, explanation: "minute=0, hour=9, any day/month, day-of-week 1-5 (Mon-Fri)." },
    { question: "Which logging level is the default for the root logger?", options: ["DEBUG", "INFO", "WARNING", "ERROR"], answer: 2, explanation: "Without configuration only WARNING and above are shown." },
    { question: "Which call logs an error together with the traceback?", options: ["logger.error()", "logger.exception() inside an except block", "logger.trace()", "print(traceback)"], answer: 1, explanation: "logger.exception logs at ERROR level and appends the current exception's traceback." },
    { question: "Why should cron commands use absolute paths?", options: ["cron runs faster with them", "cron uses a minimal environment and a different working directory", "Relative paths are illegal in Linux", "To hide the script"], answer: 1, explanation: "cron does not load your shell profile or start in your project folder." },
    { question: "Which error is a good candidate for automatic retry?", options: ["401 Unauthorized", "404 Not Found", "503 Service Unavailable", "ValueError from bad input"], answer: 2, explanation: "503 is usually temporary; the others are permanent." },
    { question: "What must the main loop of the schedule library call regularly?", options: ["schedule.start()", "schedule.run_pending()", "schedule.loop()", "schedule.execute()"], answer: 1, explanation: "run_pending() runs all jobs that are due; call it in a loop with a short sleep." },
  ],
};
