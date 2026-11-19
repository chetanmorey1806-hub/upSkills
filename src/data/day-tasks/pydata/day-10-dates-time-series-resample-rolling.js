export default {
  lesson: 'day-10-dates-time-series-resample-rolling',
  minutes: 35,
  intro: 'Parse dates, extract parts with .dt, do date arithmetic, aggregate with resample and compute moving averages and growth with rolling and pct_change.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Indian files often write dates as `05/03/2024` meaning **5 March 2024**. Which call parses them correctly?',
      options: ['pd.to_datetime(s)', 'pd.to_datetime(s, dayfirst=True)', 'pd.to_datetime(s, monthfirst=False, errors="ignore")', 's.astype("date")'],
      answer: 1,
      explain: 'Without help pandas assumes month-first (US style) and reads 05/03 as **May 3**. Use `dayfirst=True` or, best, an explicit `format="%d/%m/%Y"`. Add `errors="coerce"` to turn invalid dates into NaT instead of raising.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this print?',
      code: `import pandas as pd
d = pd.to_datetime(pd.Series(["2024-01-15", "2024-03-02"]))
print(d.dt.month.tolist())
print(d.dt.day_name().tolist())
print(d.dt.quarter.tolist())
print((d.iloc[1] - d.iloc[0]).days)`,
      expected: "[1, 3]\n['Monday', 'Saturday']\n[1, 1]\n47",
      explain: 'The `.dt` accessor exposes date parts of a datetime Series: `month`, `day_name()`, `quarter`, `year`… Subtracting two timestamps gives a **Timedelta**; `.days` returns whole days (16 days left in January + 29 in Feb 2024, a leap year + 2 = 47).',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the line that turns **daily** sales (DatetimeIndex) into **monthly** totals (month-end labels):\n\n`monthly = daily.resample("____").sum()`',
      accept: ['ME', 'M'],
      explain: '`resample` groups by a time period: `"D"` day, `"W"` week, `"ME"` month end (older pandas: `"M"`), `"QE"` quarter end, `"YE"` year end. It needs a DatetimeIndex (or `on="date"`).',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'The `orders` table has text dates. Create:\n1. convert `order_date` and `delivered` to datetime (format `%d-%m-%Y`)\n2. `orders["days"]`: delivery time in days (int)\n3. `orders["month"]`: the month name of `order_date` (e.g. "January")\n4. `late`: the `order_id`s (list) that took **more than 5 days**\n5. `feb_orders`: the number of orders placed in February 2024 (int)',
      example: { title: 'date arithmetic', code: 'df["joined"] = pd.to_datetime(df["joined"], format="%d-%m-%Y")\ndf["tenure_days"] = (pd.Timestamp("2024-12-31") - df["joined"]).dt.days\ndf["joined"].dt.month_name()' },
      starter: 'import pandas as pd\norders = pd.DataFrame({\n    "order_id": [1, 2, 3, 4, 5],\n    "order_date": ["28-01-2024", "02-02-2024", "10-02-2024", "25-02-2024", "03-03-2024"],\n    "delivered": ["01-02-2024", "09-02-2024", "13-02-2024", "04-03-2024", "06-03-2024"],\n})\n\n# TODO\n',
      solution: 'import pandas as pd\norders = pd.DataFrame({\n    "order_id": [1, 2, 3, 4, 5],\n    "order_date": ["28-01-2024", "02-02-2024", "10-02-2024", "25-02-2024", "03-03-2024"],\n    "delivered": ["01-02-2024", "09-02-2024", "13-02-2024", "04-03-2024", "06-03-2024"],\n})\n\norders["order_date"] = pd.to_datetime(orders["order_date"], format="%d-%m-%Y")\norders["delivered"] = pd.to_datetime(orders["delivered"], format="%d-%m-%Y")\norders["days"] = (orders["delivered"] - orders["order_date"]).dt.days\norders["month"] = orders["order_date"].dt.month_name()\nlate = orders.loc[orders["days"] > 5, "order_id"].tolist()\nfeb_orders = int(((orders["order_date"].dt.year == 2024) & (orders["order_date"].dt.month == 2)).sum())\n',
      tests: [
        { call: '[int(x) for x in orders["days"]]', expect: [4, 7, 3, 8, 3] },
        { call: 'orders["month"].tolist()', expect: ['January', 'February', 'February', 'February', 'March'] },
        { call: '[int(x) for x in late]', expect: [2, 4] },
        { call: 'int(feb_orders)', expect: 3 },
      ],
      explain: 'Parse first, then everything becomes easy: subtraction gives Timedeltas and `.dt.days` turns them into integers. With `format="%d-%m-%Y"` "02-02-2024" is unambiguous. Remember 2024 is a leap year, so 25 Feb → 4 Mar is 8 days.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'Daily sales for 14 days are in `daily` (DatetimeIndex from 1 Jan 2024). Create:\n1. `weekly`: weekly totals with `resample("W")` (weeks end on Sunday) as a list of ints\n2. `ma3`: the **3-day moving average** (`rolling(3).mean()`), rounded to 1 decimal\n3. `growth`: day-over-day % change (`pct_change() * 100`), rounded to 1 decimal',
      example: { title: 'rolling and pct_change', code: 's.rolling(7).mean()      # 7-day moving average (first 6 are NaN)\ns.pct_change() * 100     # % change vs previous row\ns.shift(1)               # previous value' },
      starter: 'import pandas as pd\nidx = pd.date_range("2024-01-01", periods=14, freq="D")\ndaily = pd.Series([120, 135, 128, 150, 160, 210, 230, 140, 138, 152, 149, 175, 220, 240], index=idx)\n\n# TODO: weekly, ma3, growth\n',
      solution: 'import pandas as pd\nidx = pd.date_range("2024-01-01", periods=14, freq="D")\ndaily = pd.Series([120, 135, 128, 150, 160, 210, 230, 140, 138, 152, 149, 175, 220, 240], index=idx)\n\nweekly = [int(x) for x in daily.resample("W").sum()]\nma3 = daily.rolling(3).mean().round(1)\ngrowth = (daily.pct_change() * 100).round(1)\n',
      tests: [
        { call: '[int(x) for x in weekly]', expect: [1133, 1214] },
        { call: '[int(ma3.isna().sum()), round(float(ma3.iloc[2]), 1), round(float(ma3.iloc[-1]), 1)]', expect: [2, 127.7, 211.7] },
        { call: '[round(float(growth.iloc[1]), 1), round(float(growth.iloc[7]), 1)]', expect: [12.5, -39.1] },
      ],
      explain: '1 Jan 2024 is a Monday, so `resample("W")` (week ending Sunday) gives exactly two weeks. A 3-day rolling mean needs 3 values, so the first 2 results are NaN. `pct_change()` compares each day with the previous one – the Monday drop after a strong weekend shows up as a large negative number.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'For monthly revenue `m` (one row per month), which expression gives **year-over-year** growth %?',
      options: ['m.pct_change() * 100', 'm.pct_change(12) * 100', 'm.diff(12)', 'm.rolling(12).mean()'],
      answer: 1,
      explain: '`pct_change(12)` compares each month with the **same month 12 rows earlier** (YoY). `pct_change()` is month-over-month, `diff(12)` gives the absolute change (₹, not %) and `rolling(12).mean()` is a 12-month moving average.',
    },
  ],
};
