export default {
  lesson: 'day-08-scheduling-and-logging',
  minutes: 30,
  intro: 'Read cron expressions, use the schedule library and Task Scheduler, log to files instead of print, and build a retry decorator with exponential backoff.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'What does the cron line `30 9 * * 1-5 /usr/bin/python3 /home/asha/report.py` do?',
      options: ['Runs every 30 minutes from 9 to 5', 'Runs at 09:30 every Monday to Friday', 'Runs on the 30th day of September', 'Runs at 09:30 on the 1st to 5th of every month'],
      answer: 1,
      explain: 'The 5 fields are **minute hour day-of-month month day-of-week**: 30 9 = 09:30, `*` = any, `1-5` = Monday-Friday. Always use absolute paths in cron (cron has a minimal environment) and redirect output to a log: `>> /home/asha/report.log 2>&1`.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this print? (logging levels)',
      code: `import logging, io
buf = io.StringIO()
log = logging.getLogger("bot")
log.setLevel(logging.WARNING)
h = logging.StreamHandler(buf)
h.setFormatter(logging.Formatter("%(levelname)s|%(message)s"))
log.addHandler(h)
log.debug("connecting")
log.info("report built")
log.warning("3 rows skipped")
log.error("email failed")
print(buf.getvalue().strip())`,
      expected: 'WARNING|3 rows skipped\nERROR|email failed',
      explain: 'Levels from low to high: DEBUG < INFO < WARNING < ERROR < CRITICAL. A logger set to WARNING drops DEBUG and INFO. In production use INFO for normal progress, WARNING for odd-but-handled cases and ERROR/`log.exception()` (with traceback) for failures – unlike `print`, logs carry time and level and go to a file.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: '**Log to a file.** Write `setup_logger(path)` that returns a logger named `"sales_bot"` with level INFO that writes to the file `path` using the format `%(levelname)s - %(message)s`. Calling it again must leave **exactly one** handler (remove and close any old handlers first, so lines are never duplicated). Then log `"Report started"` (INFO) and `"Missing file: pune.csv"` (WARNING).',
      example: { title: 'FileHandler', code: 'logger = logging.getLogger("app")\nlogger.setLevel(logging.INFO)\nfh = logging.FileHandler("app.log", encoding="utf-8")\nfh.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))\nlogger.addHandler(fh)' },
      starter: 'import logging\n\ndef setup_logger(path):\n    # TODO\n    pass\n',
      solution: 'import logging\n\ndef setup_logger(path):\n    logger = logging.getLogger("sales_bot")\n    logger.setLevel(logging.INFO)\n    for old in list(logger.handlers):\n        logger.removeHandler(old)\n        old.close()\n    fh = logging.FileHandler(path, encoding="utf-8")\n    fh.setFormatter(logging.Formatter("%(levelname)s - %(message)s"))\n    logger.addHandler(fh)\n    return logger\n\nlog = setup_logger("bot.log")\nsetup_logger("bot.log")\nlog.info("Report started")\nlog.warning("Missing file: pune.csv")\nfor h in log.handlers:\n    h.flush()\n',
      tests: [
        { call: '[h.flush() for h in __import__("logging").getLogger("sales_bot").handlers] and None or open("bot.log", encoding="utf-8").read().splitlines()', expect: ['INFO - Report started', 'WARNING - Missing file: pune.csv'] },
        { call: 'len(setup_logger("bot.log").handlers)', expect: 1, msg: 'calling setup_logger again must not add another handler' },
      ],
      explain: '`logging.getLogger(name)` returns the **same** logger object every time, so adding a handler on every call duplicates each log line – a very common bug in scripts and notebooks. Remove old handlers first (or configure logging once at start-up and check `if not logger.handlers`). Use `RotatingFileHandler` so log files do not grow forever.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: '**Retry decorator.** Write a decorator factory `retry(times=3, base_delay=1, sleeper=time.sleep)` that retries the wrapped function when it raises an exception, waiting `base_delay * 2**attempt` seconds via `sleeper(...)` between attempts (1, 2, 4 …). After `times` failed attempts in total, re-raise the last exception. (Tests pass a fake `sleeper` so nothing really waits.)',
      example: { title: 'a decorator with arguments', code: 'import functools\ndef repeat(n):\n    def deco(func):\n        @functools.wraps(func)\n        def wrapper(*a, **kw):\n            for _ in range(n):\n                result = func(*a, **kw)\n            return result\n        return wrapper\n    return deco' },
      starter: 'import time, functools\n\ndef retry(times=3, base_delay=1, sleeper=time.sleep):\n    # TODO\n    pass\n',
      solution: 'import time, functools\n\ndef retry(times=3, base_delay=1, sleeper=time.sleep):\n    def deco(func):\n        @functools.wraps(func)\n        def wrapper(*args, **kwargs):\n            for attempt in range(times):\n                try:\n                    return func(*args, **kwargs)\n                except Exception:\n                    if attempt == times - 1:\n                        raise\n                    sleeper(base_delay * 2 ** attempt)\n        return wrapper\n    return deco\n',
      tests: [
        { call: '(lambda waits, calls: (retry(times=4, sleeper=waits.append)(lambda: calls.append(1) or (1 / 0 if len(calls) < 3 else "done"))(), waits, len(calls)))([], [])', expect: ['done', [1, 2], 3], msg: 'fails twice, succeeds on the 3rd call after waiting 1 and 2 seconds' },
        { call: '__import__("unittest").TestCase().assertRaises(ZeroDivisionError, retry(times=2, sleeper=lambda s: None)(lambda: 1 / 0))', expect: null, msg: 'after all attempts fail, the exception must be raised again' },
        { call: 'retry()(lambda: 7)()', expect: 7 },
      ],
      explain: 'A decorator factory has three levels: `retry(...)` returns `deco`, `deco(func)` returns `wrapper`. `functools.wraps` keeps the original function name for logs. Injecting `sleeper` makes the code testable without waiting – in production it is `time.sleep`. Add a random "jitter" when many bots retry at the same time.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about scheduling are TRUE? (choose all that apply)',
      options: ['`schedule.every().day.at("09:00").do(job)` only runs while your Python loop with `schedule.run_pending()` is running', 'cron / Windows Task Scheduler start your script even after a reboot', 'In Task Scheduler you should set "Start in" to the script folder so relative paths work', 'The schedule library keeps working after you close the terminal', 'Logging and alerts tell you when a scheduled job failed at night'],
      answers: [0, 1, 2, 4],
      explain: 'The `schedule` library is in-process: when the Python process stops, nothing runs. OS schedulers (cron, Task Scheduler, systemd timers) are more reliable for daily jobs. Either way you need logs and failure alerts, because nobody is watching at 6 AM.',
    },
  ],
};
