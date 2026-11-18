export default {
  id: "extra-07-datetime-time-zoneinfo",
  title: "datetime, time and zoneinfo: Working with Dates, Times and Time Zones",
  module: "Module 2: Standard Library Power Tools",
  extraNo: 7,
  level: "Intermediate",
  duration: "2.5 hours",
  summary: "Handle dates and times correctly: create date, time and datetime objects, do arithmetic with timedelta, format and parse with strftime/strptime and ISO 8601, measure performance with the time module, and work with aware datetimes and real time zones (Asia/Kolkata, America/New_York) using zoneinfo.",
  objectives: [
    "Create and compare date, time and datetime objects",
    "Add and subtract durations with timedelta and compute ages and due dates",
    "Format with strftime and parse with strptime / fromisoformat",
    "Use time.time, time.perf_counter, time.sleep and time.monotonic correctly",
    "Explain naive vs aware datetimes and convert between zones with zoneinfo",
  ],
  theory: [
    {
      heading: "The datetime Module's Main Types",
      content: `The \`datetime\` module has four main classes:

**date** - a calendar date (year, month, day). **time** - a time of day (hour, minute, second, microsecond). **datetime** - date and time combined. **timedelta** - a duration (difference between two dates/datetimes).

All of these objects are **immutable** - methods like \`replace()\` return new objects. Invalid values raise ValueError, e.g. \`date(2025, 2, 30)\`.`,
      syntax: `from datetime import date, time, datetime, timedelta
d = date(2025, 8, 15)
t = time(9, 30)
dt = datetime(2025, 8, 15, 9, 30)
dt2 = datetime.combine(d, t)
today = date.today()
now = datetime.now()
d.year, d.month, d.day, d.weekday()   # weekday: Monday=0 ... Sunday=6
`,
    },
    {
      heading: "Date Arithmetic with timedelta",
      content: `\`timedelta(days=, seconds=, microseconds=, milliseconds=, minutes=, hours=, weeks=)\` represents a duration. You can add or subtract it from dates and datetimes, and subtracting two dates gives a timedelta. Internally timedelta stores only days, seconds and microseconds; use \`.days\` and \`.total_seconds()\` to read it.

timedelta has no months or years because their length varies. For 'add one month', use \`replace(month=...)\` carefully, or the third-party \`dateutil.relativedelta\`.`,
      points: [
        "due = issue_date + timedelta(days=14)",
        "age_days = (date.today() - birth_date).days",
        "`td.total_seconds()` gives total seconds as float; `td.seconds` is only the seconds part (0-86399)",
      ],
    },
    {
      heading: "Formatting and Parsing: strftime, strptime, ISO 8601",
      content: `\`strftime(format)\` (string FORMAT time) converts a date to text; \`datetime.strptime(text, format)\` (string PARSE time) converts text to a datetime. Common codes: \`%Y\` 4-digit year, \`%m\` month, \`%d\` day, \`%H\` 24-hour, \`%I\` 12-hour, \`%M\` minute, \`%S\` second, \`%p\` AM/PM, \`%A\`/\`%a\` weekday name, \`%B\`/\`%b\` month name, \`%j\` day of year, \`%z\` UTC offset, \`%Z\` zone name.

For APIs and databases use **ISO 8601** (\`2025-08-15T09:30:00+05:30\`): \`dt.isoformat()\` and \`datetime.fromisoformat(text)\`. Since Python 3.11, fromisoformat accepts most ISO formats including a trailing \`Z\`.`,
      syntax: `dt.strftime("%d-%m-%Y %I:%M %p")     # '15-08-2025 09:30 AM'
datetime.strptime("15/08/2025", "%d/%m/%Y")
datetime.fromisoformat("2025-08-15T09:30:00+05:30")
`,
      tip: "strptime raises ValueError if the text does not match the format exactly. Always validate user-entered dates inside try/except.",
    },
    {
      heading: "The time Module",
      content: `The \`time\` module works with lower-level time values. \`time.time()\` returns seconds since the Unix epoch (1 Jan 1970 UTC) as a float - use it for timestamps. \`time.perf_counter()\` is a high-resolution clock for **measuring durations** (benchmarking). \`time.monotonic()\` never goes backwards, even if the system clock is changed - use it for timeouts. \`time.sleep(seconds)\` pauses the current thread.

Convert a timestamp to datetime with \`datetime.fromtimestamp(ts, tz=...)\` and back with \`dt.timestamp()\`.`,
      points: [
        "Measure code speed: perf_counter (not time.time)",
        "Store event times: datetime in UTC or time.time() timestamp",
        "`time.strftime` / `time.localtime` exist but datetime is easier",
      ],
    },
    {
      heading: "Naive vs Aware Datetimes",
      content: `A **naive** datetime has no time-zone information (\`tzinfo is None\`). Python does not know whether it is IST, UTC or something else. An **aware** datetime has a tzinfo and represents an exact moment on the timeline.

You cannot compare or subtract naive and aware datetimes (TypeError). Best practice in backend development: **store and compute in UTC (aware), convert to the user's zone only for display**. \`datetime.utcnow()\` returns a NAIVE value and is deprecated since 3.12 - use \`datetime.now(timezone.utc)\` instead.`,
      syntax: `from datetime import datetime, timezone, timedelta
utc_now = datetime.now(timezone.utc)           # aware UTC
ist = timezone(timedelta(hours=5, minutes=30))  # fixed offset
`,
    },
    {
      heading: "Real Time Zones with zoneinfo",
      content: `\`zoneinfo.ZoneInfo\` (Python 3.9+) gives real IANA time zones like \`Asia/Kolkata\`, \`Europe/London\` or \`America/New_York\`, including daylight saving time (DST) rules. It uses the operating system's tz database; on Windows you may need \`pip install tzdata\`.

Attach a zone to a naive datetime with \`replace(tzinfo=ZoneInfo(...))\` (this does not change the clock time), and convert an aware datetime to another zone with \`astimezone(ZoneInfo(...))\` (this keeps the same moment but changes the clock time). A fixed \`timezone(timedelta(hours=-5))\` does NOT know about DST, so prefer ZoneInfo for real places.`,
      syntax: `from zoneinfo import ZoneInfo
meeting = datetime(2025, 3, 10, 21, 0, tzinfo=ZoneInfo("Asia/Kolkata"))
meeting.astimezone(ZoneInfo("America/New_York"))
`,
    },
  ],
  examples: [
    {
      title: "Library Due Dates and Age Calculation",
      scenario: "A library app calculates the due date (14 days), late fees, and a member's age in years on a given date.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `from datetime import date, timedelta

issued = date(2025, 1, 20)
due = issued + timedelta(days=14)
returned = date(2025, 2, 10)
print("Issued:", issued, "| Due:", due, "| Weekday:", due.strftime("%A"))

late_days = (returned - due).days
fee = max(0, late_days) * 5
print(f"Returned {late_days} days late, fee = Rs {fee}")

def age_on(birth, on):
    years = on.year - birth.year
    if (on.month, on.day) < (birth.month, birth.day):
        years -= 1
    return years

dob = date(2000, 8, 15)
print("Age on 2025-08-14:", age_on(dob, date(2025, 8, 14)))
print("Age on 2025-08-15:", age_on(dob, date(2025, 8, 15)))

span = date(2025, 12, 31) - date(2025, 1, 1)
print(span, "|", span.days, "days |", span.total_seconds(), "seconds")
print(date(2024, 2, 28) + timedelta(days=1), date(2025, 2, 28) + timedelta(days=1))
`,
      python: {
        files: {
          "main.py": `from datetime import date, timedelta

issued = date(2025, 1, 20)
due = issued + timedelta(days=14)
returned = date(2025, 2, 10)
print("Issued:", issued, "| Due:", due, "| Weekday:", due.strftime("%A"))

late_days = (returned - due).days
fee = max(0, late_days) * 5
print(f"Returned {late_days} days late, fee = Rs {fee}")

def age_on(birth, on):
    years = on.year - birth.year
    if (on.month, on.day) < (birth.month, birth.day):
        years -= 1
    return years

dob = date(2000, 8, 15)
print("Age on 2025-08-14:", age_on(dob, date(2025, 8, 14)))
print("Age on 2025-08-15:", age_on(dob, date(2025, 8, 15)))

span = date(2025, 12, 31) - date(2025, 1, 1)
print(span, "|", span.days, "days |", span.total_seconds(), "seconds")
print(date(2024, 2, 28) + timedelta(days=1), date(2025, 2, 28) + timedelta(days=1))
`,
        },
      },
      result: `Issued: 2025-01-20 | Due: 2025-02-03 | Weekday: Monday
Returned 7 days late, fee = Rs 35
Age on 2025-08-14: 24
Age on 2025-08-15: 25
364 days, 0:00:00 | 364 days | 31449600.0 seconds
2024-02-29 2025-03-01`,
      explanation: "Adding a timedelta moves the date; subtracting dates gives a timedelta whose .days is the gap. Age uses tuple comparison of (month, day) to check if the birthday has occurred yet. timedelta handles leap years automatically (2024 has 29 Feb).",
    },
    {
      title: "Formatting and Parsing Dates",
      scenario: "An HR system imports joining dates in different text formats and displays them in Indian style.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `from datetime import datetime

raw = ["15/08/2023", "2024-01-26", "07 Mar 2022 14:45", "31/02/2024"]
formats = ["%d/%m/%Y", "%Y-%m-%d", "%d %b %Y %H:%M"]

def parse(text):
    for fmt in formats:
        try:
            return datetime.strptime(text, fmt)
        except ValueError:
            continue
    return None

for r in raw:
    dt = parse(r)
    if dt:
        print(f"{r:<18} -> {dt:%d-%b-%Y (%a) %I:%M %p}")
    else:
        print(f"{r:<18} -> invalid date")

dt = datetime(2025, 8, 15, 9, 5, 30)
print(dt.isoformat())
print(dt.strftime("Day %j of %Y, week %U"))
print(datetime.fromisoformat("2025-08-15T09:05:30+05:30"))
print(datetime.fromisoformat("2025-08-15T03:35:30Z"))
`,
      python: {
        files: {
          "main.py": `from datetime import datetime

raw = ["15/08/2023", "2024-01-26", "07 Mar 2022 14:45", "31/02/2024"]
formats = ["%d/%m/%Y", "%Y-%m-%d", "%d %b %Y %H:%M"]

def parse(text):
    for fmt in formats:
        try:
            return datetime.strptime(text, fmt)
        except ValueError:
            continue
    return None

for r in raw:
    dt = parse(r)
    if dt:
        print(f"{r:<18} -> {dt:%d-%b-%Y (%a) %I:%M %p}")
    else:
        print(f"{r:<18} -> invalid date")

dt = datetime(2025, 8, 15, 9, 5, 30)
print(dt.isoformat())
print(dt.strftime("Day %j of %Y, week %U"))
print(datetime.fromisoformat("2025-08-15T09:05:30+05:30"))
print(datetime.fromisoformat("2025-08-15T03:35:30Z"))
`,
        },
      },
      result: `15/08/2023         -> 15-Aug-2023 (Tue) 12:00 AM
2024-01-26         -> 26-Jan-2024 (Fri) 12:00 AM
07 Mar 2022 14:45  -> 07-Mar-2022 (Mon) 02:45 PM
31/02/2024         -> invalid date
2025-08-15T09:05:30
Day 227 of 2025, week 32
2025-08-15 09:05:30+05:30
2025-08-15 03:35:30+00:00`,
      explanation: "The parser tries several strptime formats and catches ValueError. 31/02/2024 matches the pattern but is not a real date, so it fails too. isoformat/fromisoformat handle the standard API format; 'Z' parsing needs Python 3.11+.",
    },
    {
      title: "Measuring Performance with the time Module",
      scenario: "A developer compares two ways of building a big string and records event timestamps.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import time
from datetime import datetime, timezone

def concat_plus(n):
    s = ""
    for i in range(n):
        s += str(i)
    return s

def concat_join(n):
    return "".join(str(i) for i in range(n))

for func in (concat_plus, concat_join):
    start = time.perf_counter()
    result = func(200_000)
    elapsed = time.perf_counter() - start
    print(f"{func.__name__}: length={len(result)} took {'<' if elapsed < 5 else '>='} 5 s")

ts = 1_700_000_000
print("Timestamp", ts, "=", datetime.fromtimestamp(ts, tz=timezone.utc))
print(datetime(2025, 1, 1, tzinfo=timezone.utc).timestamp())

t0 = time.monotonic()
time.sleep(0.2)
print("Slept at least 0.2s:", time.monotonic() - t0 >= 0.2)
`,
      python: {
        files: {
          "main.py": `import time
from datetime import datetime, timezone

def concat_plus(n):
    s = ""
    for i in range(n):
        s += str(i)
    return s

def concat_join(n):
    return "".join(str(i) for i in range(n))

for func in (concat_plus, concat_join):
    start = time.perf_counter()
    result = func(200_000)
    elapsed = time.perf_counter() - start
    print(f"{func.__name__}: length={len(result)} took {'<' if elapsed < 5 else '>='} 5 s")

ts = 1_700_000_000
print("Timestamp", ts, "=", datetime.fromtimestamp(ts, tz=timezone.utc))
print(datetime(2025, 1, 1, tzinfo=timezone.utc).timestamp())

t0 = time.monotonic()
time.sleep(0.2)
print("Slept at least 0.2s:", time.monotonic() - t0 >= 0.2)
`,
        },
      },
      result: `concat_plus: length=1088890 took < 5 s
concat_join: length=1088890 took < 5 s
Timestamp 1700000000 = 2023-11-14 22:13:20+00:00
1735689600.0
Slept at least 0.2s: True`,
      explanation: "perf_counter is the right clock for measuring code speed (exact times vary by machine, so we only print a safe comparison). fromtimestamp converts epoch seconds to a datetime; timestamp() converts back. monotonic is safe for measuring waits.",
    },
    {
      title: "Naive vs Aware and Fixed Offsets",
      scenario: "A payment gateway logs transactions in UTC but must show Indian Standard Time on receipts.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `from datetime import datetime, timezone, timedelta

IST = timezone(timedelta(hours=5, minutes=30), "IST")

naive = datetime(2025, 8, 15, 10, 0)
print("naive tzinfo:", naive.tzinfo)

txn_utc = datetime(2025, 8, 15, 4, 30, tzinfo=timezone.utc)
txn_ist = txn_utc.astimezone(IST)
print("UTC:", txn_utc.isoformat())
print("IST:", txn_ist.isoformat(), txn_ist.strftime("%d %b %Y %I:%M %p %Z"))
print("Same moment?", txn_utc == txn_ist)

try:
    print(naive < txn_utc)
except TypeError as e:
    print("TypeError:", e)

as_ist = naive.replace(tzinfo=IST)
print("replace :", as_ist.isoformat())
print("in UTC  :", as_ist.astimezone(timezone.utc).isoformat())
`,
      python: {
        files: {
          "main.py": `from datetime import datetime, timezone, timedelta

IST = timezone(timedelta(hours=5, minutes=30), "IST")

naive = datetime(2025, 8, 15, 10, 0)
print("naive tzinfo:", naive.tzinfo)

txn_utc = datetime(2025, 8, 15, 4, 30, tzinfo=timezone.utc)
txn_ist = txn_utc.astimezone(IST)
print("UTC:", txn_utc.isoformat())
print("IST:", txn_ist.isoformat(), txn_ist.strftime("%d %b %Y %I:%M %p %Z"))
print("Same moment?", txn_utc == txn_ist)

try:
    print(naive < txn_utc)
except TypeError as e:
    print("TypeError:", e)

as_ist = naive.replace(tzinfo=IST)
print("replace :", as_ist.isoformat())
print("in UTC  :", as_ist.astimezone(timezone.utc).isoformat())
`,
        },
      },
      result: `naive tzinfo: None
UTC: 2025-08-15T04:30:00+00:00
IST: 2025-08-15T10:00:00+05:30 15 Aug 2025 10:00 AM IST
Same moment? True
TypeError: can't compare offset-naive and offset-aware datetimes
replace : 2025-08-15T10:00:00+05:30
in UTC  : 2025-08-15T04:30:00+00:00`,
      explanation: "Aware datetimes in different zones compare equal if they are the same instant. Mixing naive and aware raises TypeError. replace(tzinfo=) labels the existing clock time; astimezone converts it.",
    },
    {
      title: "Scheduling Across Countries with zoneinfo",
      scenario: "An Indian team schedules a 9 PM IST call with clients in New York and London, in both winter and summer, to see the effect of daylight saving time.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `from datetime import datetime
from zoneinfo import ZoneInfo

kolkata = ZoneInfo("Asia/Kolkata")
zones = ["America/New_York", "Europe/London", "Asia/Tokyo", "UTC"]

for month in (1, 7):
    call = datetime(2025, month, 15, 21, 0, tzinfo=kolkata)
    print(f"Call at {call:%d %b %H:%M %Z} (UTC{call:%z})")
    for z in zones:
        local = call.astimezone(ZoneInfo(z))
        print(f"   {z:<17} {local:%d %b %H:%M %Z}  UTC{local:%z}")

ny = ZoneInfo("America/New_York")
before = datetime(2025, 3, 8, 12, 0, tzinfo=ny)
after = datetime(2025, 3, 9, 12, 0, tzinfo=ny)
print("Wall clock gap:", after - before)
print("Real gap      :", after.astimezone(ZoneInfo("UTC")) - before.astimezone(ZoneInfo("UTC")))
`,
      result: `Call at 15 Jan 21:00 IST (UTC+0530)
   America/New_York  15 Jan 10:30 EST  UTC-0500
   Europe/London     15 Jan 15:30 GMT  UTC+0000
   Asia/Tokyo        16 Jan 00:30 JST  UTC+0900
   UTC               15 Jan 15:30 UTC  UTC+0000
Call at 15 Jul 21:00 IST (UTC+0530)
   America/New_York  15 Jul 11:30 EDT  UTC-0400
   Europe/London     15 Jul 16:30 BST  UTC+0100
   Asia/Tokyo        16 Jul 00:30 JST  UTC+0900
   UTC               15 Jul 15:30 UTC  UTC+0000
Wall clock gap: 1 day, 0:00:00
Real gap      : 23:00:00`,
      explanation: "ZoneInfo knows DST rules: New York is UTC-5 (EST) in January but UTC-4 (EDT) in July; London switches between GMT and BST; India has no DST. Subtracting two datetimes in the same zone gives the wall-clock difference; converting to UTC shows that only 23 real hours passed across the DST switch. (This example needs the tz database, so run it locally.)",
    },
  ],
  interview: [
    {
      q: "What is the difference between date, time, datetime and timedelta?",
      a: "date holds year/month/day; time holds hour/minute/second/microsecond; datetime holds both; timedelta is a duration used for arithmetic. date and datetime minus each other give a timedelta.",
      level: "Easy",
    },
    {
      q: "How do you get the number of days between two dates?",
      a: "Subtract them and use `.days`: `(date(2025, 12, 25) - date.today()).days`. The result is a timedelta.",
      level: "Easy",
    },
    {
      q: "What is the difference between strftime and strptime?",
      a: "strftime (format) converts a date/datetime object to a string using format codes. strptime (parse) is a class method that converts a string to a datetime using the given format; it raises ValueError on mismatch.",
      level: "Easy",
    },
    {
      q: "Why doesn't timedelta support months?",
      a: "Months and years have variable length (28-31 days, leap years), so 'one month' is not a fixed duration. timedelta stores fixed amounts (days, seconds, microseconds). Use `replace()` with care or `dateutil.relativedelta` for calendar arithmetic.",
      level: "Medium",
    },
    {
      q: "What is a naive vs an aware datetime?",
      a: "A naive datetime has tzinfo=None and does not represent a specific global instant. An aware datetime has a tzinfo with an offset, so it represents an exact moment. You cannot compare or subtract naive and aware values (TypeError).",
      level: "Medium",
    },
    {
      q: "Why is datetime.utcnow() discouraged?",
      a: "It returns a naive datetime that holds UTC clock time, so the object does not know it is UTC. Calling `.timestamp()` or `.astimezone()` on it treats it as local time, causing bugs. It is deprecated since Python 3.12. Use `datetime.now(timezone.utc)`.",
      level: "Hard",
    },
    {
      q: "What is the best practice for storing datetimes in a backend system?",
      a: "Store aware datetimes in UTC (or as UTC timestamps) in the database, do all calculations in UTC, and convert to the user's local zone (ZoneInfo) only when displaying. Use ISO 8601 strings in APIs.",
      level: "Medium",
    },
    {
      q: "Difference between replace(tzinfo=...) and astimezone(...)?",
      a: "replace(tzinfo=...) attaches or swaps the zone label without changing the clock fields - the instant changes. astimezone(tz) converts an aware datetime to another zone, keeping the same instant and adjusting the clock fields.",
      level: "Hard",
    },
    {
      q: "Why use ZoneInfo instead of timezone(timedelta(hours=-5))?",
      a: "A fixed timezone has one constant offset and ignores daylight saving changes. ZoneInfo('America/New_York') uses the IANA database and applies EST/EDT correctly for each date, including historical rule changes.",
      level: "Medium",
    },
    {
      q: "Which clock should you use to measure how long code takes?",
      a: "`time.perf_counter()` - it has the highest available resolution and is monotonic. `time.time()` can jump if the system clock is adjusted (NTP), so it is not reliable for durations. `timeit` is better for micro-benchmarks.",
      level: "Medium",
    },
    {
      q: "What does td.seconds return for timedelta(days=1, hours=2)?",
      a: "7200 - only the seconds part beyond whole days. To get the full duration in seconds use `td.total_seconds()`, which returns 93600.0.",
      level: "Hard",
    },
    {
      q: "How do you convert a Unix timestamp to datetime and back?",
      a: "`datetime.fromtimestamp(ts, tz=timezone.utc)` creates an aware datetime; `dt.timestamp()` returns epoch seconds. Without tz, fromtimestamp returns local naive time, which depends on the server's settings.",
      level: "Medium",
    },
  ],
  practice: [
    {
      task: "Given a subscription start date 2025-01-31 and a plan of 45 days, print the expiry date, its weekday name and how many days are left on 2025-02-20.",
      hint: "expiry = start + timedelta(days=45); (expiry - today).days",
      solution: `from datetime import date, timedelta

start = date(2025, 1, 31)
expiry = start + timedelta(days=45)
today = date(2025, 2, 20)
print("Expiry:", expiry, expiry.strftime("%A"))
print("Days left:", (expiry - today).days)
`,
    },
    {
      task: "Write `is_valid_date(text)` that returns True if text is a real date in DD-MM-YYYY format. Test with '29-02-2024', '29-02-2025', '2024-02-29'.",
      hint: "Use datetime.strptime inside try/except ValueError.",
      solution: `from datetime import datetime

def is_valid_date(text):
    try:
        datetime.strptime(text, "%d-%m-%Y")
        return True
    except ValueError:
        return False

for t in ["29-02-2024", "29-02-2025", "2024-02-29"]:
    print(t, is_valid_date(t))
`,
    },
    {
      task: "Generate all Mondays in March 2025 using a loop with timedelta and print them as 'Mon 03 Mar'.",
      hint: "Start at date(2025, 3, 1), move forward to the first Monday (weekday() == 0), then add 7 days while month == 3.",
      solution: `from datetime import date, timedelta

d = date(2025, 3, 1)
while d.weekday() != 0:
    d += timedelta(days=1)
while d.month == 3:
    print(d.strftime("%a %d %b"))
    d += timedelta(weeks=1)
`,
    },
    {
      task: "Two log timestamps are '2025-08-15 09:15:20' and '2025-08-15 17:42:05'. Parse them and print the difference in hours, minutes and seconds.",
      hint: "Use divmod on int(td.total_seconds()).",
      solution: `from datetime import datetime

fmt = "%Y-%m-%d %H:%M:%S"
a = datetime.strptime("2025-08-15 09:15:20", fmt)
b = datetime.strptime("2025-08-15 17:42:05", fmt)
secs = int((b - a).total_seconds())
h, rem = divmod(secs, 3600)
m, s = divmod(rem, 60)
print(f"{h}h {m}m {s}s")
`,
    },
    {
      task: "A webinar starts at 2025-11-20 19:30 in Asia/Kolkata. Print the start time in Europe/Berlin, America/Los_Angeles and Australia/Sydney using zoneinfo.",
      hint: "Create an aware datetime with tzinfo=ZoneInfo('Asia/Kolkata') and call astimezone for each zone. (Run locally: needs the tz database.)",
      solution: `from datetime import datetime
from zoneinfo import ZoneInfo

start = datetime(2025, 11, 20, 19, 30, tzinfo=ZoneInfo("Asia/Kolkata"))
for zone in ["Europe/Berlin", "America/Los_Angeles", "Australia/Sydney"]:
    local = start.astimezone(ZoneInfo(zone))
    print(f"{zone:<20} {local:%d %b %Y %I:%M %p %Z}")
`,
    },
  ],
  quiz: [
    {
      question: "What is the type of date(2025, 5, 10) - date(2025, 5, 1)?",
      options: [
        "int",
        "date",
        "timedelta",
        "float",
      ],
      answer: 2,
      explanation: "Subtracting two dates gives a timedelta (here 9 days).",
    },
    {
      question: "Which format string parses '26/01/2025'?",
      options: [
        "%Y/%m/%d",
        "%d/%m/%Y",
        "%m/%d/%Y",
        "%d-%m-%Y",
      ],
      answer: 1,
      explanation: "Day / month / 4-digit year matches %d/%m/%Y.",
    },
    {
      question: "Which is the recommended way to get the current UTC time?",
      options: [
        "datetime.utcnow()",
        "datetime.now(timezone.utc)",
        "time.gmtime()",
        "date.today()",
      ],
      answer: 1,
      explanation: "It returns an aware datetime; utcnow() returns a naive one and is deprecated.",
    },
    {
      question: "Comparing a naive datetime with an aware datetime using < ...",
      options: [
        "Treats naive as UTC",
        "Treats naive as local time",
        "Raises TypeError",
        "Always returns False",
      ],
      answer: 2,
      explanation: "Python refuses to compare offset-naive and offset-aware datetimes.",
    },
    {
      question: "Which clock is best for benchmarking code?",
      options: [
        "time.time()",
        "datetime.now()",
        "time.perf_counter()",
        "time.localtime()",
      ],
      answer: 2,
      explanation: "perf_counter is a high-resolution monotonic clock designed for measuring durations.",
    },
    {
      question: "astimezone(ZoneInfo('UTC')) on an aware IST datetime...",
      options: [
        "Changes only the label, keeps the clock time",
        "Keeps the same instant and changes the clock time",
        "Removes tzinfo",
        "Raises an error",
      ],
      answer: 1,
      explanation: "astimezone converts to another zone; the moment in time stays the same.",
    },
  ],
};
