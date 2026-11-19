export default {
  lesson: 'extra-07-datetime-time-zoneinfo',
  minutes: 30,
  intro: 'Work with dates and times: timedelta arithmetic, strftime/strptime, ISO format, naive vs aware datetimes and time zone conversion.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'You want to measure how long a function takes to run. Which is the right tool?',
      options: ['`datetime.now()` before and after', '`time.time()` before and after', '`time.perf_counter()` before and after', '`time.sleep()`'],
      answer: 2,
      explain: '`perf_counter()` is a high-resolution, monotonic clock made for measuring durations. `time.time()` and `datetime.now()` follow the wall clock, which can jump when the system time is adjusted.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `from datetime import date, datetime, timedelta
d = date(2024, 2, 28) + timedelta(days=2)
print(d)
td = timedelta(days=1, hours=2)
print(td.total_seconds(), td.seconds)
dt = datetime(2025, 8, 15, 9, 5)
print(dt.strftime("%d/%m/%Y %H:%M"))
print(dt.strftime("%A"))`,
      expected: '2024-03-01\n93600.0 7200\n15/08/2025 09:05\nFriday',
      explain: '2024 is a leap year, so Feb 28 + 2 days = Feb 29 + 1 = **March 1**. `total_seconds()` is the whole duration, while `.seconds` is only the seconds part *within the day* (2 hours = 7200). `%A` is the full weekday name.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: ['A naive datetime has no tzinfo', 'You can subtract a naive datetime from an aware one', 'Storing times in UTC and converting for display is a good practice', 'India Standard Time is UTC+05:30', '`strptime` turns a datetime into a string'],
      answers: [0, 2, 3],
      explain: 'Naive = no time zone; mixing naive and aware datetimes in arithmetic raises TypeError. Store in UTC, convert only for display. `strptime` = string **p**arse time (string → datetime); `strftime` = **f**ormat (datetime → string).',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'A library lends books for 14 days and charges ₹5 per day late. Write `fine(issued, returned)` where both are strings `"DD-MM-YYYY"`. Parse them with `datetime.strptime`, and return the fine in rupees (0 if returned within 14 days).',
      example: { title: 'parsing and subtracting dates', code: 'from datetime import datetime\na = datetime.strptime("01-01-2025", "%d-%m-%Y")\nb = datetime.strptime("11-01-2025", "%d-%m-%Y")\nprint((b - a).days)  # 10' },
      starter: 'from datetime import datetime\n\ndef fine(issued, returned):\n    # TODO\n    return 0\n',
      solution: 'from datetime import datetime\n\ndef fine(issued, returned):\n    fmt = "%d-%m-%Y"\n    days = (datetime.strptime(returned, fmt) - datetime.strptime(issued, fmt)).days\n    return max(0, days - 14) * 5\n',
      tests: [
        { call: 'fine("01-03-2025", "10-03-2025")', expect: 0 },
        { call: 'fine("01-03-2025", "15-03-2025")', expect: 0, msg: 'Exactly 14 days is on time' },
        { call: 'fine("01-03-2025", "20-03-2025")', expect: 25 },
        { call: 'fine("25-12-2024", "10-01-2025")', expect: 10, msg: 'Works across years' },
      ],
      explain: 'Subtracting two datetimes gives a `timedelta`; `.days` is the whole number of days. `max(0, ...)` avoids a negative fine. The format codes must match the input exactly: `%d-%m-%Y` for "01-03-2025".',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `age_on(birth, on)` that takes two `date` objects and returns the completed age in **years** (a birthday that has not happened yet this year does not count).',
      example: { title: 'comparing month/day tuples', code: '(3, 15) < (4, 1)   # True: 15 March is before 1 April' },
      starter: 'from datetime import date\n\ndef age_on(birth, on):\n    # TODO\n    return on.year - birth.year\n',
      solution: 'from datetime import date\n\ndef age_on(birth, on):\n    years = on.year - birth.year\n    if (on.month, on.day) < (birth.month, birth.day):\n        years -= 1\n    return years\n',
      tests: [
        { call: 'age_on(date(2000, 5, 20), date(2025, 5, 20))', expect: 25 },
        { call: 'age_on(date(2000, 5, 20), date(2025, 5, 19))', expect: 24 },
        { call: 'age_on(date(2004, 12, 31), date(2025, 1, 1))', expect: 20 },
      ],
      explain: 'Just subtracting the years is wrong before the birthday. Dividing `(on - birth).days` by 365 is also wrong because of leap years. Comparing `(month, day)` tuples is the exact rule.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'A server logs times in UTC as ISO strings like `"2025-01-10T20:15:00+00:00"`. Write `to_ist(iso)` that parses it with `datetime.fromisoformat`, converts it to India time (UTC+05:30, build it with `timezone(timedelta(hours=5, minutes=30))`) and returns `"DD Mon YYYY, HH:MM"` e.g. `"11 Jan 2025, 01:45"`.',
      example: { title: 'converting an aware datetime', code: 'from datetime import datetime, timezone, timedelta\nDUBAI = timezone(timedelta(hours=4))\ndt = datetime(2025, 1, 1, 12, 0, tzinfo=timezone.utc)\nprint(dt.astimezone(DUBAI))  # 2025-01-01 16:00:00+04:00' },
      starter: 'from datetime import datetime, timezone, timedelta\n\nIST = timezone(timedelta(hours=5, minutes=30))\n\ndef to_ist(iso):\n    # TODO\n    return iso\n',
      solution: 'from datetime import datetime, timezone, timedelta\n\nIST = timezone(timedelta(hours=5, minutes=30))\n\ndef to_ist(iso):\n    dt = datetime.fromisoformat(iso)\n    return dt.astimezone(IST).strftime("%d %b %Y, %H:%M")\n',
      tests: [
        { call: 'to_ist("2025-01-10T20:15:00+00:00")', expect: '11 Jan 2025, 01:45', msg: 'Crossing midnight moves the date' },
        { call: 'to_ist("2025-06-01T04:30:00+00:00")', expect: '01 Jun 2025, 10:00' },
      ],
      explain: '`fromisoformat` keeps the `+00:00` offset, so the datetime is **aware**; `astimezone(IST)` then shifts the clock by +5:30 and can change the date. `zoneinfo.ZoneInfo("Asia/Kolkata")` does the same with real zone rules. Formatting first and adding hours to the string is a common mistake.',
    },
  ],
};
