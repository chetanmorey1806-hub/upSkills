export default {
  "id": "day-10-dates-time-series-resample-rolling",
  "title": "Dates and Time Series: to_datetime, dt Accessor, resample and rolling",
  "module": "Module 2: Pandas",
  "day": 10,
  "level": "Intermediate",
  "duration": "3.5 hours",
  "summary": "Work with dates like a pro: parse text into datetime with to_datetime, extract year/month/weekday with the .dt accessor, do date arithmetic with Timedelta and DateOffset, create ranges with date_range, aggregate by period with resample and Grouper, compute moving averages with rolling, and calculate growth with shift and pct_change.",
  "objectives": [
    "Convert text to datetime with pd.to_datetime (format, dayfirst, errors)",
    "Extract parts of dates with .dt (year, month, month_name, day_name, quarter, to_period)",
    "Do date arithmetic: differences in days, adding Timedelta/DateOffset, filtering date ranges",
    "Aggregate time series with resample('D'/'W'/'ME'/'QE') and pd.Grouper",
    "Compute moving averages (rolling), cumulative totals, shift, diff and pct_change (MoM / YoY growth)"
  ],
  "theory": [
    {
      "heading": "Datetime Basics in pandas",
      "content": "Dates read from CSV or Excel are often plain text. Convert them with `pd.to_datetime` so pandas understands them as `datetime64[ns]` - then you can sort chronologically, compute differences, filter ranges and group by month.\n\nA single date is a `Timestamp`; a duration is a `Timedelta`; a column of dates is a datetime Series; an index of dates is a `DatetimeIndex`.",
      "syntax": "df['order_date'] = pd.to_datetime(df['order_date'])                     # ISO 2024-04-05\npd.to_datetime('05/04/2024', dayfirst=True)                             # 5 April 2024\npd.to_datetime(df['d'], format='%d-%m-%Y', errors='coerce')               # explicit format\npd.read_csv('sales.csv', parse_dates=['order_date'])",
      "points": [
        "Format codes: %d day, %m month number, %b short month (Apr), %B full month, %Y 4-digit year, %y 2-digit year, %H:%M:%S time",
        "Indian data often uses dd/mm/yyyy - always pass dayfirst=True or an explicit format, otherwise 05/04 may become May 4",
        "errors='coerce' converts invalid dates to NaT"
      ]
    },
    {
      "heading": "The .dt Accessor",
      "content": "A datetime column exposes its parts through `.dt`. These are perfect for creating report columns like Month or Weekday.",
      "points": [
        "`.dt.year`, `.dt.month`, `.dt.day`, `.dt.hour`, `.dt.quarter`",
        "`.dt.month_name()`, `.dt.day_name()` - 'April', 'Friday'",
        "`.dt.dayofweek` - Monday=0 ... Sunday=6; weekend: `dt.dayofweek >= 5`",
        "`.dt.to_period('M')` - 2024-04 (month period, great for grouping)",
        "`.dt.strftime('%b-%Y')` - format as text 'Apr-2024'",
        "`.dt.date`, `.dt.normalize()` - drop the time part",
        "`.dt.days` on a Timedelta column - number of days"
      ]
    },
    {
      "heading": "Date Arithmetic and Filtering",
      "content": "Subtracting two dates gives a Timedelta (e.g. delivery time). Add durations with `pd.Timedelta(days=7)` or calendar-aware offsets with `pd.DateOffset(months=1)`. Compare dates with strings directly.",
      "syntax": "df['delivery_days'] = (df['delivered'] - df['ordered']).dt.days\ndf['due_date'] = df['invoice_date'] + pd.Timedelta(days=30)\ndf['next_month'] = df['date'] + pd.DateOffset(months=1)\ndf[df['date'] >= '2024-04-01']\ndf[df['date'].between('2024-04-01', '2024-06-30')]\npd.Timestamp('today').normalize()",
      "tip": "With a DatetimeIndex, partial string indexing works: df.loc['2024-04'] returns all of April; df.loc['2024-04-10':'2024-04-20'] returns a range."
    },
    {
      "heading": "date_range and DatetimeIndex",
      "content": "`pd.date_range(start, end/periods, freq)` creates a sequence of dates - useful for building calendars, filling missing dates and simulations. Set a date column as the index with `set_index('date')` to unlock time-series features.",
      "points": [
        "Frequencies: 'D' day, 'B' business day, 'W' week (Sunday), 'W-MON', 'MS' month start, 'ME' month end, 'QE' quarter end, 'YE' year end, 'h' hour",
        "In pandas 2.2+ 'M', 'Q', 'Y' were renamed to 'ME', 'QE', 'YE' (old aliases give a FutureWarning)",
        "`df.asfreq('D')` or `reindex(pd.date_range(...))` reveals missing dates"
      ],
      "syntax": "pd.date_range('2024-04-01', periods=7, freq='D')\npd.date_range('2024-01-01', '2024-12-31', freq='MS')"
    },
    {
      "heading": "resample: Group by Time Period",
      "content": "`resample` is groupby for time. On a DatetimeIndex, `df.resample('ME')['sales'].sum()` gives monthly totals; 'W' weekly; 'QE' quarterly. It also creates rows for periods with no data (filled with 0 for sum, NaN for mean). Without setting the index, use `on='date'` or `groupby(pd.Grouper(key='date', freq='ME'))`, which also lets you group by other columns at the same time.",
      "syntax": "daily.resample('W')['sales'].sum()\ndf.resample('ME', on='order_date')['amount'].agg(['sum', 'count'])\ndf.groupby([pd.Grouper(key='order_date', freq='ME'), 'region'])['amount'].sum()"
    },
    {
      "heading": "rolling, shift, diff and pct_change",
      "content": "Time-series analysis compares values over time.",
      "points": [
        "`rolling(7).mean()` - 7-day moving average to smooth daily noise; `min_periods=1` avoids NaN at the start",
        "`expanding().sum()` or `cumsum()` - running total (year-to-date)",
        "`shift(1)` - previous period's value (lag); `shift(-1)` - next period",
        "`diff()` - change from previous period",
        "`pct_change()` - growth rate; `pct_change(12)` on monthly data = year-over-year growth"
      ],
      "tip": "Always sort by date (sort_values or sort_index) before rolling, shift or pct_change - otherwise you compare the wrong rows."
    }
  ],
  "examples": [
    {
      "title": "Parsing Dates and Extracting Parts with .dt",
      "scenario": "Orders exported from an Indian billing system have dates in dd-mm-yyyy text. Convert them and add Month, Weekday, Quarter and Weekend columns for a report.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import pandas as pd\n\norders = pd.DataFrame({\n    \"order_id\": [1, 2, 3, 4, 5],\n    \"order_date\": [\"05-04-2024\", \"13-04-2024\", \"28-05-2024\", \"02-06-2024\", \"15-07-2024\"],\n    \"amount\": [2500, 1800, 3200, 900, 4100],\n})\norders[\"order_date\"] = pd.to_datetime(orders[\"order_date\"], format=\"%d-%m-%Y\")\norders[\"month\"] = orders[\"order_date\"].dt.month_name()\norders[\"weekday\"] = orders[\"order_date\"].dt.day_name()\norders[\"quarter\"] = orders[\"order_date\"].dt.quarter\norders[\"is_weekend\"] = orders[\"order_date\"].dt.dayofweek >= 5\norders[\"period\"] = orders[\"order_date\"].dt.to_period(\"M\")\nprint(orders)\nprint(orders.dtypes[\"order_date\"])\nprint(orders.groupby(\"period\")[\"amount\"].sum())\n",
      "python": {
        "files": {
          "main.py": "import pandas as pd\n\norders = pd.DataFrame({\n    \"order_id\": [1, 2, 3, 4, 5],\n    \"order_date\": [\"05-04-2024\", \"13-04-2024\", \"28-05-2024\", \"02-06-2024\", \"15-07-2024\"],\n    \"amount\": [2500, 1800, 3200, 900, 4100],\n})\norders[\"order_date\"] = pd.to_datetime(orders[\"order_date\"], format=\"%d-%m-%Y\")\norders[\"month\"] = orders[\"order_date\"].dt.month_name()\norders[\"weekday\"] = orders[\"order_date\"].dt.day_name()\norders[\"quarter\"] = orders[\"order_date\"].dt.quarter\norders[\"is_weekend\"] = orders[\"order_date\"].dt.dayofweek >= 5\norders[\"period\"] = orders[\"order_date\"].dt.to_period(\"M\")\nprint(orders)\nprint(orders.dtypes[\"order_date\"])\nprint(orders.groupby(\"period\")[\"amount\"].sum())\n"
        }
      },
      "result": "   order_id order_date  amount  month   weekday  quarter  is_weekend   period\n0         1 2024-04-05    2500  April    Friday        2       False  2024-04\n1         2 2024-04-13    1800  April  Saturday        2        True  2024-04\n2         3 2024-05-28    3200    May   Tuesday        2       False  2024-05\n3         4 2024-06-02     900   June    Sunday        2        True  2024-06\n4         5 2024-07-15    4100   July    Monday        3       False  2024-07\ndatetime64[ns]\nperiod\n2024-04    4300\n2024-05    3200\n2024-06     900\n2024-07    4100\nFreq: M, Name: amount, dtype: int64",
      "explanation": "format='%d-%m-%Y' guarantees 05-04-2024 is read as 5 April, not 4 May. The .dt accessor returns month and day names, quarter and day of week (Saturday = 5, Sunday = 6). to_period('M') creates a year-month label that groups neatly for monthly reports."
    },
    {
      "title": "Delivery Time and Due Dates (Date Arithmetic)",
      "scenario": "Calculate delivery days for e-commerce orders, flag late deliveries (more than 5 days), and compute invoice payment due dates 30 days after delivery.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import pandas as pd\n\ndf = pd.DataFrame({\n    \"order_id\": [101, 102, 103, 104],\n    \"ordered\": pd.to_datetime([\"2024-04-01\", \"2024-04-03\", \"2024-04-10\", \"2024-04-28\"]),\n    \"delivered\": pd.to_datetime([\"2024-04-04\", \"2024-04-11\", \"2024-04-13\", \"2024-05-06\"]),\n})\ndf[\"delivery_days\"] = (df[\"delivered\"] - df[\"ordered\"]).dt.days\ndf[\"late\"] = df[\"delivery_days\"] > 5\ndf[\"payment_due\"] = df[\"delivered\"] + pd.Timedelta(days=30)\ndf[\"next_review\"] = df[\"ordered\"] + pd.DateOffset(months=1)\nprint(df)\nprint(\"Average delivery days:\", df[\"delivery_days\"].mean())\nprint(df[df[\"ordered\"].between(\"2024-04-01\", \"2024-04-15\")][\"order_id\"].tolist())\n",
      "python": {
        "files": {
          "main.py": "import pandas as pd\n\ndf = pd.DataFrame({\n    \"order_id\": [101, 102, 103, 104],\n    \"ordered\": pd.to_datetime([\"2024-04-01\", \"2024-04-03\", \"2024-04-10\", \"2024-04-28\"]),\n    \"delivered\": pd.to_datetime([\"2024-04-04\", \"2024-04-11\", \"2024-04-13\", \"2024-05-06\"]),\n})\ndf[\"delivery_days\"] = (df[\"delivered\"] - df[\"ordered\"]).dt.days\ndf[\"late\"] = df[\"delivery_days\"] > 5\ndf[\"payment_due\"] = df[\"delivered\"] + pd.Timedelta(days=30)\ndf[\"next_review\"] = df[\"ordered\"] + pd.DateOffset(months=1)\nprint(df)\nprint(\"Average delivery days:\", df[\"delivery_days\"].mean())\nprint(df[df[\"ordered\"].between(\"2024-04-01\", \"2024-04-15\")][\"order_id\"].tolist())\n"
        }
      },
      "result": "   order_id    ordered  delivered  delivery_days   late payment_due next_review\n0       101 2024-04-01 2024-04-04              3  False  2024-05-04  2024-05-01\n1       102 2024-04-03 2024-04-11              8   True  2024-05-11  2024-05-03\n2       103 2024-04-10 2024-04-13              3  False  2024-05-13  2024-05-10\n3       104 2024-04-28 2024-05-06              8   True  2024-06-05  2024-05-28\nAverage delivery days: 5.5\n[101, 102, 103]",
      "explanation": "Subtracting two datetime columns gives a Timedelta; .dt.days converts it to whole days. Timedelta(days=30) adds an exact duration, while DateOffset(months=1) moves to the same day next month (calendar aware). between() works with date strings to filter a range."
    },
    {
      "title": "resample: Daily Sales to Weekly and Monthly",
      "scenario": "A store has daily sales for 60 days. Summarise weekly and monthly totals and find the best week.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import pandas as pd\nimport numpy as np\n\nrng = np.random.default_rng(1)\ndates = pd.date_range(\"2024-04-01\", periods=60, freq=\"D\")\ndaily = pd.DataFrame({\"sales\": rng.integers(8000, 15000, size=60)}, index=dates)\ndaily.index.name = \"date\"\nprint(daily.head(3))\n\nmonthly = daily.resample(\"ME\")[\"sales\"].agg([\"sum\", \"mean\", \"count\"]).round(0)\nprint(monthly)\nweekly = daily.resample(\"W\")[\"sales\"].sum()\nprint(weekly.head(3))\nprint(\"Best week ending:\", weekly.idxmax().date(), weekly.max())\nprint(\"April 10-12:\", daily.loc[\"2024-04-10\":\"2024-04-12\", \"sales\"].tolist())\n",
      "python": {
        "files": {
          "main.py": "import pandas as pd\nimport numpy as np\n\nrng = np.random.default_rng(1)\ndates = pd.date_range(\"2024-04-01\", periods=60, freq=\"D\")\ndaily = pd.DataFrame({\"sales\": rng.integers(8000, 15000, size=60)}, index=dates)\ndaily.index.name = \"date\"\nprint(daily.head(3))\n\nmonthly = daily.resample(\"ME\")[\"sales\"].agg([\"sum\", \"mean\", \"count\"]).round(0)\nprint(monthly)\nweekly = daily.resample(\"W\")[\"sales\"].sum()\nprint(weekly.head(3))\nprint(\"Best week ending:\", weekly.idxmax().date(), weekly.max())\nprint(\"April 10-12:\", daily.loc[\"2024-04-10\":\"2024-04-12\", \"sales\"].tolist())\n"
        }
      },
      "result": "            sales\ndate             \n2024-04-01  11312\n2024-04-02  11582\n2024-04-03  13286\n               sum     mean  count\ndate                              \n2024-04-30  347640  11588.0     30\n2024-05-31  339973  11332.0     30\ndate\n2024-04-07    81845\n2024-04-14    83317\n2024-04-21    75866\nFreq: W-SUN, Name: sales, dtype: int64\nBest week ending: 2024-04-28 87623\nApril 10-12: [10182, 14083, 10963]",
      "explanation": "date_range builds 60 consecutive dates used as a DatetimeIndex. resample('ME') groups by calendar month and labels each bucket with the month-end date: 60 days from 1 April end on 30 May, so each month has 30 days of data (the May bucket is still labelled 2024-05-31). resample('W') groups by weeks ending on Sunday. Partial string slicing with loc selects a date range directly."
    },
    {
      "title": "Moving Average, MoM and YoY Growth",
      "scenario": "Monthly revenue for two years (in lakh rupees). Compute a 3-month moving average, month-over-month growth, year-over-year growth and year-to-date totals.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import pandas as pd\n\nmonths = pd.date_range(\"2023-01-01\", periods=24, freq=\"MS\")\nrevenue = [40, 42, 45, 43, 47, 50, 52, 51, 55, 58, 62, 70,\n           46, 47, 50, 49, 54, 57, 60, 58, 63, 66, 71, 80]\ndf = pd.DataFrame({\"revenue\": revenue}, index=months)\n\ndf[\"ma_3\"] = df[\"revenue\"].rolling(3).mean().round(1)\ndf[\"mom_pct\"] = (df[\"revenue\"].pct_change() * 100).round(1)\ndf[\"yoy_pct\"] = (df[\"revenue\"].pct_change(12) * 100).round(1)\ndf[\"prev_month\"] = df[\"revenue\"].shift(1)\ndf[\"ytd\"] = df.groupby(df.index.year)[\"revenue\"].cumsum()\nprint(df.tail(6))\nprint(\"2024 total:\", df.loc[\"2024\", \"revenue\"].sum(), \"vs 2023:\", df.loc[\"2023\", \"revenue\"].sum())\n",
      "python": {
        "files": {
          "main.py": "import pandas as pd\n\nmonths = pd.date_range(\"2023-01-01\", periods=24, freq=\"MS\")\nrevenue = [40, 42, 45, 43, 47, 50, 52, 51, 55, 58, 62, 70,\n           46, 47, 50, 49, 54, 57, 60, 58, 63, 66, 71, 80]\ndf = pd.DataFrame({\"revenue\": revenue}, index=months)\n\ndf[\"ma_3\"] = df[\"revenue\"].rolling(3).mean().round(1)\ndf[\"mom_pct\"] = (df[\"revenue\"].pct_change() * 100).round(1)\ndf[\"yoy_pct\"] = (df[\"revenue\"].pct_change(12) * 100).round(1)\ndf[\"prev_month\"] = df[\"revenue\"].shift(1)\ndf[\"ytd\"] = df.groupby(df.index.year)[\"revenue\"].cumsum()\nprint(df.tail(6))\nprint(\"2024 total:\", df.loc[\"2024\", \"revenue\"].sum(), \"vs 2023:\", df.loc[\"2023\", \"revenue\"].sum())\n"
        }
      },
      "result": "            revenue  ma_3  mom_pct  yoy_pct  prev_month  ytd\n2024-07-01       60  57.0      5.3     15.4        57.0  363\n2024-08-01       58  58.3     -3.3     13.7        60.0  421\n2024-09-01       63  60.3      8.6     14.5        58.0  484\n2024-10-01       66  62.3      4.8     13.8        63.0  550\n2024-11-01       71  66.7      7.6     14.5        66.0  621\n2024-12-01       80  72.3     12.7     14.3        71.0  701\n2024 total: 701 vs 2023: 615",
      "explanation": "rolling(3).mean() averages the current and previous two months, smoothing short-term noise. pct_change() compares each month with the previous one (MoM); pct_change(12) compares with the same month last year (YoY). shift(1) shows last month's value. Grouping cumsum by year restarts the year-to-date total every January. df.loc['2024'] selects all rows of 2024."
    },
    {
      "title": "Filling Missing Dates and Grouper with Categories",
      "scenario": "An order log skips days with no orders. Build a complete daily calendar (missing days = 0), then compute monthly revenue per channel with pd.Grouper.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import pandas as pd\n\nlog = pd.DataFrame({\n    \"date\": pd.to_datetime([\"2024-03-29\", \"2024-03-30\", \"2024-04-01\", \"2024-04-01\",\n                            \"2024-04-03\", \"2024-04-04\"]),\n    \"channel\": [\"App\", \"Web\", \"App\", \"Web\", \"App\", \"App\"],\n    \"amount\": [1200, 800, 1500, 600, 900, 1100],\n})\ndaily = log.groupby(\"date\")[\"amount\"].sum()\nfull = daily.reindex(pd.date_range(\"2024-03-29\", \"2024-04-04\", freq=\"D\"), fill_value=0)\nprint(full)\nprint(\"Days with no orders:\", (full == 0).sum())\n\nprint(log.groupby([pd.Grouper(key=\"date\", freq=\"ME\"), \"channel\"])[\"amount\"].sum())\n",
      "python": {
        "files": {
          "main.py": "import pandas as pd\n\nlog = pd.DataFrame({\n    \"date\": pd.to_datetime([\"2024-03-29\", \"2024-03-30\", \"2024-04-01\", \"2024-04-01\",\n                            \"2024-04-03\", \"2024-04-04\"]),\n    \"channel\": [\"App\", \"Web\", \"App\", \"Web\", \"App\", \"App\"],\n    \"amount\": [1200, 800, 1500, 600, 900, 1100],\n})\ndaily = log.groupby(\"date\")[\"amount\"].sum()\nfull = daily.reindex(pd.date_range(\"2024-03-29\", \"2024-04-04\", freq=\"D\"), fill_value=0)\nprint(full)\nprint(\"Days with no orders:\", (full == 0).sum())\n\nprint(log.groupby([pd.Grouper(key=\"date\", freq=\"ME\"), \"channel\"])[\"amount\"].sum())\n"
        }
      },
      "result": "2024-03-29    1200\n2024-03-30     800\n2024-03-31       0\n2024-04-01    2100\n2024-04-02       0\n2024-04-03     900\n2024-04-04    1100\nFreq: D, Name: amount, dtype: int64\nDays with no orders: 2\ndate        channel\n2024-03-31  App        1200\n            Web         800\n2024-04-30  App        3500\n            Web         600\nName: amount, dtype: int64",
      "explanation": "Grouping by date gives one total per day that had orders. reindex with a full date_range inserts the missing days (31 March and 2 April) with 0 - important before rolling averages or charts, otherwise gaps are hidden. pd.Grouper(key='date', freq='ME') groups by month inside a normal groupby, so it can be combined with other keys like channel."
    }
  ],
  "interview": [
    {
      "q": "How do you convert a string column to datetime in pandas?",
      "a": "pd.to_datetime(df['col']). Pass format='%d-%m-%Y' (faster and unambiguous) or dayfirst=True for dd/mm/yyyy data, and errors='coerce' to turn invalid dates into NaT. Or use parse_dates in read_csv.",
      "level": "Easy"
    },
    {
      "q": "How do you extract month name and weekday from a date column?",
      "a": "df['date'].dt.month_name() and df['date'].dt.day_name(). Numeric versions: dt.month and dt.dayofweek (Monday=0).",
      "level": "Easy"
    },
    {
      "q": "What is the difference between resample and groupby?",
      "a": "resample is a time-based groupby on a DatetimeIndex (or a column via on=) using frequencies like 'W', 'ME', 'QE'. It creates bins for all periods in the range, even empty ones. groupby groups by arbitrary keys; with pd.Grouper(freq=...) it can do time bins plus other keys.",
      "level": "Medium"
    },
    {
      "q": "What does rolling(7).mean() do?",
      "a": "It computes a moving average over a window of 7 consecutive rows - each value is the mean of the current and previous 6 rows. The first 6 results are NaN unless min_periods is set. It smooths daily fluctuations to show the trend.",
      "level": "Medium"
    },
    {
      "q": "How do you calculate month-over-month and year-over-year growth?",
      "a": "On monthly data sorted by date: MoM = df['rev'].pct_change() * 100; YoY = df['rev'].pct_change(12) * 100. Equivalent: (rev / rev.shift(n) - 1) * 100.",
      "level": "Medium"
    },
    {
      "q": "Difference between shift() and diff()?",
      "a": "shift(n) moves values down by n rows (lag), returning the previous values. diff(n) returns the difference value - value.shift(n).",
      "level": "Easy"
    },
    {
      "q": "Difference between Timedelta and DateOffset?",
      "a": "Timedelta is an absolute duration (e.g. 30 days = exactly 30*24 hours). DateOffset is calendar-aware: adding DateOffset(months=1) to 31 Jan gives 29 Feb in a leap year; it respects month lengths and business days (BDay).",
      "level": "Hard"
    },
    {
      "q": "How would you find dates with no sales in a time series?",
      "a": "Create the full calendar with pd.date_range(min, max, freq='D') and compare: full.difference(df['date'].unique()), or reindex the daily totals on the full range with fill_value=0 and filter zeros. asfreq('D') on a DatetimeIndex also reveals gaps.",
      "level": "Medium"
    },
    {
      "q": "What is partial string indexing?",
      "a": "With a sorted DatetimeIndex, df.loc['2024'] selects a whole year, df.loc['2024-04'] a month, and df.loc['2024-04-01':'2024-04-15'] a range - without building datetime objects.",
      "level": "Medium"
    },
    {
      "q": "Why did 05/04/2024 become 4 May instead of 5 April?",
      "a": "pandas assumes month-first (US) format by default. Use dayfirst=True or an explicit format='%d/%m/%Y' for Indian/European formats. Always verify by checking a date where day > 12.",
      "level": "Easy"
    },
    {
      "q": "How do you compute a year-to-date running total that resets each year?",
      "a": "df.groupby(df['date'].dt.year)['sales'].cumsum() (or df.index.year when dates are the index).",
      "level": "Hard"
    },
    {
      "q": "What frequency aliases are used for month end and quarter end in pandas 2.2+?",
      "a": "'ME' (month end), 'MS' (month start), 'QE' (quarter end), 'QS', 'YE' (year end). The older 'M', 'Q', 'Y' are deprecated for these offsets.",
      "level": "Hard"
    }
  ],
  "practice": [
    {
      "task": "Given joining dates ['15/06/2019', '01/11/2021', '20/03/2023'] (day first) for three employees, compute their tenure in completed years as of 2024-12-31.",
      "hint": "pd.to_datetime(..., dayfirst=True); (ref - date).dt.days // 365",
      "solution": "import pandas as pd\n\nemp = pd.DataFrame({\"name\": [\"Asha\", \"Ravi\", \"Neha\"],\n                    \"joined\": [\"15/06/2019\", \"01/11/2021\", \"20/03/2023\"]})\nemp[\"joined\"] = pd.to_datetime(emp[\"joined\"], dayfirst=True)\nref = pd.Timestamp(\"2024-12-31\")\nemp[\"tenure_years\"] = (ref - emp[\"joined\"]).dt.days // 365\nprint(emp)\n"
    },
    {
      "task": "Create daily website visits for 28 days starting 2024-02-01 (use np.arange(100, 128)) and compute weekly totals (weeks starting Monday) and a 7-day rolling average.",
      "hint": "resample('W-SUN') sums weeks ending Sunday; rolling(7).mean()",
      "solution": "import pandas as pd\nimport numpy as np\n\ns = pd.Series(np.arange(100, 128), index=pd.date_range(\"2024-02-01\", periods=28, freq=\"D\"))\nprint(s.resample(\"W-SUN\").sum())\nprint(s.rolling(7).mean().dropna().head())\n"
    },
    {
      "task": "From an orders table with order_date and amount, compute revenue per month and per weekday name, and find the busiest weekday.",
      "hint": "dt.to_period('M') and dt.day_name() with groupby",
      "solution": "import pandas as pd\n\ndf = pd.DataFrame({\n    \"order_date\": pd.to_datetime([\"2024-04-01\", \"2024-04-06\", \"2024-04-07\",\n                                  \"2024-05-04\", \"2024-05-05\", \"2024-05-13\"]),\n    \"amount\": [1200, 3400, 2800, 4100, 3900, 1500],\n})\nprint(df.groupby(df[\"order_date\"].dt.to_period(\"M\"))[\"amount\"].sum())\nwd = df.groupby(df[\"order_date\"].dt.day_name())[\"amount\"].sum()\nprint(wd)\nprint(\"Busiest:\", wd.idxmax())\n"
    },
    {
      "task": "Monthly sales for 6 months: [120, 135, 128, 150, 162, 158]. Compute MoM growth %, the 3-month moving average and flag months where sales dropped.",
      "hint": "pct_change, rolling(3).mean(), diff() < 0",
      "solution": "import pandas as pd\n\ns = pd.Series([120, 135, 128, 150, 162, 158],\n              index=pd.date_range(\"2024-01-01\", periods=6, freq=\"MS\"))\ndf = pd.DataFrame({\"sales\": s})\ndf[\"mom_pct\"] = (s.pct_change() * 100).round(1)\ndf[\"ma3\"] = s.rolling(3).mean().round(1)\ndf[\"dropped\"] = s.diff() < 0\nprint(df)\n"
    }
  ],
  "quiz": [
    {
      "question": "Which accessor gives date parts of a datetime Series?",
      "options": [
        ".str",
        ".dt",
        ".date",
        ".time"
      ],
      "answer": 1,
      "explanation": ".dt exposes year, month, day_name and more."
    },
    {
      "question": "pd.to_datetime('03/04/2024', dayfirst=True) is:",
      "options": [
        "3 April 2024",
        "4 March 2024",
        "Error",
        "NaT"
      ],
      "answer": 0,
      "explanation": "dayfirst=True reads the first number as the day."
    },
    {
      "question": "Which code gives monthly totals from a daily series with a DatetimeIndex?",
      "options": [
        "s.groupby('M').sum()",
        "s.resample('ME').sum()",
        "s.rolling('M').sum()",
        "s.shift('M')"
      ],
      "answer": 1,
      "explanation": "resample('ME') bins by month end."
    },
    {
      "question": "pct_change(12) on monthly data computes:",
      "options": [
        "12-month moving average",
        "Month-over-month growth",
        "Year-over-year growth",
        "Cumulative total"
      ],
      "answer": 2,
      "explanation": "It compares each month with the value 12 rows earlier."
    },
    {
      "question": "Subtracting two datetime columns returns:",
      "options": [
        "int64",
        "Timedelta",
        "Period",
        "str"
      ],
      "answer": 1,
      "explanation": "The difference is a timedelta64 Series; use .dt.days for numbers."
    },
    {
      "question": "What does rolling(3).mean() return for the first two rows?",
      "options": [
        "0",
        "The value itself",
        "NaN",
        "Error"
      ],
      "answer": 2,
      "explanation": "A full window of 3 is needed unless min_periods is lowered."
    }
  ]
};
