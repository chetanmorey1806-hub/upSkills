export default {
  "id": "day-11-apply-map-vectorization-performance",
  "title": "apply, map, Vectorized Operations and Performance Tips",
  "module": "Module 2: Pandas",
  "day": 11,
  "level": "Intermediate",
  "duration": "3 hours",
  "summary": "Learn when to use Series.map, Series.apply, DataFrame.apply (axis=1), DataFrame.map and replace, and why vectorized operations, np.where, np.select, pd.cut and pd.qcut are usually much faster. Finish with practical performance tips: category dtype, downcasting, method chaining, avoiding iterrows and measuring memory and time.",
  "objectives": [
    "Use map with a dict or function to translate values (like a lookup)",
    "Use apply on a Series and on DataFrame rows (axis=1) and know its cost",
    "Replace row-wise apply with vectorized arithmetic, np.where, np.select and str/dt accessors",
    "Bin numbers into categories with pd.cut and pd.qcut",
    "Reduce memory with category and smaller numeric dtypes, and write clean method chains with assign and pipe"
  ],
  "theory": [
    {
      "heading": "map: Element-wise Translation of a Series",
      "content": "`Series.map(arg)` transforms each value. `arg` can be a **dict** (lookup table - values not found become NaN), another **Series** (index used as the lookup key) or a **function**. It is the quickest way to translate codes into labels, like state codes to state names.",
      "syntax": "codes = {'MH': 'Maharashtra', 'KA': 'Karnataka', 'DL': 'Delhi'}\ndf['state_name'] = df['state'].map(codes)\ndf['name_len'] = df['name'].map(len)\ndf['gst_rate'] = df['category'].map(rate_series)",
      "tip": "If you want unmatched values to stay unchanged instead of NaN, use replace(dict) or map(dict).fillna(df['col'])."
    },
    {
      "heading": "apply on Series and DataFrames",
      "content": "`Series.apply(func)` calls a Python function for every element - useful for complex logic that has no built-in method. `DataFrame.apply(func, axis=0)` applies a function to each column; `axis=1` applies it to each **row** (the row is passed as a Series), which is how you use several columns in one custom calculation.\n\n`DataFrame.map(func)` (called `applymap` before pandas 2.1) applies a function to every single cell.",
      "syntax": "df['grade'] = df['marks'].apply(lambda m: 'A' if m >= 85 else 'B' if m >= 60 else 'C')\ndf['bonus'] = df.apply(lambda r: r['salary'] * 0.2 if r['rating'] >= 4 else r['salary'] * 0.05, axis=1)\ndf[['a', 'b']].apply(lambda col: col.max() - col.min())   # per column\ndf.map(lambda x: f'{x:,}')                                  # every cell",
      "tip": "apply with axis=1 is a hidden Python loop. On 1 million rows it can take tens of seconds where a vectorized version takes milliseconds."
    },
    {
      "heading": "Vectorization: the Fast Way",
      "content": "Most row-wise logic can be written with whole-column operations that run in C:",
      "points": [
        "Arithmetic across columns: `df['revenue'] = df['price'] * df['qty']`",
        "Two-way condition: `np.where(df['rating'] >= 4, df['salary'] * 0.2, df['salary'] * 0.05)`",
        "Many conditions: `np.select([cond1, cond2], [choice1, choice2], default=...)`",
        "Text: `.str` methods; dates: `.dt` methods instead of apply",
        "Lookups: `map(dict)` or `merge` instead of apply with a dictionary lookup",
        "Clipping/rounding: `clip`, `round`, `abs` are all vectorized"
      ],
      "tip": "Rule of thumb, from fastest to slowest: built-in vectorized methods > NumPy functions > map with dict > apply on Series > apply(axis=1) > iterrows. Avoid iterrows for calculations."
    },
    {
      "heading": "Binning with pd.cut and pd.qcut",
      "content": "Turning numbers into groups (age bands, salary bands, order size buckets) is a common analyst task.",
      "syntax": "pd.cut(df['age'], bins=[0, 25, 35, 50, 100], labels=['<25', '25-35', '35-50', '50+'])\npd.cut(df['amount'], bins=4)                 # 4 equal-width bins\npd.qcut(df['amount'], q=4, labels=['Q1', 'Q2', 'Q3', 'Q4'])   # 4 equal-count bins (quartiles)",
      "points": [
        "cut uses fixed bin edges you choose (or equal width); bins are right-inclusive by default: (25, 35] - use right=False for [25, 35)",
        "qcut uses quantiles, so each bin has about the same number of rows - good for customer segmentation (top 25% spenders)",
        "The result is a categorical column that sorts in bin order"
      ]
    },
    {
      "heading": "Memory and Speed Tips",
      "content": "Large datasets can slow your laptop or crash Colab. These habits help:",
      "points": [
        "Check memory: `df.info(memory_usage='deep')` or `df.memory_usage(deep=True).sum()`",
        "Convert repeated text to `category`: a city column with 10 unique values in 1 million rows shrinks by up to 90%",
        "Downcast numbers: `pd.to_numeric(s, downcast='integer')`, float64 -> float32",
        "Read only needed columns: `read_csv(usecols=[...], dtype={...})`",
        "Filter early, aggregate before merging large tables",
        "Avoid growing DataFrames in a loop - collect rows in a list and create the DataFrame once",
        "Time code with `%timeit` in Jupyter or `time.perf_counter()`",
        "For very large data consider Parquet files, PyArrow-backed dtypes, Polars or DuckDB"
      ]
    },
    {
      "heading": "Method Chaining, assign and pipe",
      "content": "Method chaining writes a whole transformation as one readable pipeline, with each step on its own line inside parentheses. `assign` adds columns (use a lambda to refer to the DataFrame at that point in the chain), `query` filters, and `pipe` inserts your own function.",
      "syntax": "report = (\n    df.query('status == \"Delivered\"')\n      .assign(revenue=lambda d: d['price'] * d['qty'],\n              month=lambda d: d['date'].dt.to_period('M'))\n      .groupby('month', as_index=False)['revenue'].sum()\n      .pipe(add_growth_column)\n)"
    }
  ],
  "examples": [
    {
      "title": "map with a Dictionary and replace",
      "scenario": "Orders contain state codes and payment codes. Translate them into readable names and apply the GST rate per category from a lookup Series.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import pandas as pd\n\norders = pd.DataFrame({\n    \"order_id\": [1, 2, 3, 4, 5],\n    \"state\": [\"MH\", \"KA\", \"DL\", \"MH\", \"GJ\"],\n    \"pay\": [\"U\", \"C\", \"U\", \"D\", \"U\"],\n    \"category\": [\"Electronics\", \"Books\", \"Clothing\", \"Electronics\", \"Books\"],\n    \"amount\": [20000, 500, 1500, 12000, 800],\n})\nstates = {\"MH\": \"Maharashtra\", \"KA\": \"Karnataka\", \"DL\": \"Delhi\"}\norders[\"state_name\"] = orders[\"state\"].map(states)\norders[\"pay_mode\"] = orders[\"pay\"].replace({\"U\": \"UPI\", \"C\": \"Card\", \"D\": \"COD\"})\ngst = pd.Series({\"Electronics\": 0.18, \"Books\": 0.0, \"Clothing\": 0.05})\norders[\"gst\"] = orders[\"amount\"] * orders[\"category\"].map(gst)\nprint(orders.drop(columns=[\"state\", \"pay\"]))\nprint(\"Unmapped states:\", orders.loc[orders[\"state_name\"].isna(), \"state\"].tolist())\n",
      "python": {
        "files": {
          "main.py": "import pandas as pd\n\norders = pd.DataFrame({\n    \"order_id\": [1, 2, 3, 4, 5],\n    \"state\": [\"MH\", \"KA\", \"DL\", \"MH\", \"GJ\"],\n    \"pay\": [\"U\", \"C\", \"U\", \"D\", \"U\"],\n    \"category\": [\"Electronics\", \"Books\", \"Clothing\", \"Electronics\", \"Books\"],\n    \"amount\": [20000, 500, 1500, 12000, 800],\n})\nstates = {\"MH\": \"Maharashtra\", \"KA\": \"Karnataka\", \"DL\": \"Delhi\"}\norders[\"state_name\"] = orders[\"state\"].map(states)\norders[\"pay_mode\"] = orders[\"pay\"].replace({\"U\": \"UPI\", \"C\": \"Card\", \"D\": \"COD\"})\ngst = pd.Series({\"Electronics\": 0.18, \"Books\": 0.0, \"Clothing\": 0.05})\norders[\"gst\"] = orders[\"amount\"] * orders[\"category\"].map(gst)\nprint(orders.drop(columns=[\"state\", \"pay\"]))\nprint(\"Unmapped states:\", orders.loc[orders[\"state_name\"].isna(), \"state\"].tolist())\n"
        }
      },
      "result": "   order_id     category  amount   state_name pay_mode     gst\n0         1  Electronics   20000  Maharashtra      UPI  3600.0\n1         2        Books     500    Karnataka     Card     0.0\n2         3     Clothing    1500        Delhi      UPI    75.0\n3         4  Electronics   12000  Maharashtra      COD  2160.0\n4         5        Books     800          NaN      UPI     0.0\nUnmapped states: ['GJ']",
      "explanation": "map with a dict acts like VLOOKUP: GJ is not in the dictionary, so it becomes NaN - easy to detect missing mappings. replace leaves unmatched values unchanged. Mapping with a Series uses its index as the key, so each category picks its GST rate, then the multiplication is vectorized."
    },
    {
      "title": "apply vs np.where vs np.select",
      "scenario": "HR calculates a bonus: 20% of salary for rating >= 4, 10% for rating 3, otherwise 5%. Write it with apply(axis=1) and with vectorized np.select and check they match.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import pandas as pd\nimport numpy as np\n\nemp = pd.DataFrame({\n    \"name\": [\"Asha\", \"Vikram\", \"Neha\", \"Arjun\", \"Pooja\"],\n    \"salary\": [65000, 42000, 72000, 48000, 51000],\n    \"rating\": [5, 3, 4, 2, 3],\n})\n\ndef bonus_row(r):\n    if r[\"rating\"] >= 4:\n        return r[\"salary\"] * 0.20\n    elif r[\"rating\"] == 3:\n        return r[\"salary\"] * 0.10\n    return r[\"salary\"] * 0.05\n\nemp[\"bonus_apply\"] = emp.apply(bonus_row, axis=1)\nemp[\"bonus_vec\"] = emp[\"salary\"] * np.select(\n    [emp[\"rating\"] >= 4, emp[\"rating\"] == 3], [0.20, 0.10], default=0.05)\nemp[\"band\"] = np.where(emp[\"salary\"] >= 50000, \"Senior\", \"Junior\")\nprint(emp)\nprint(\"Same result:\", emp[\"bonus_apply\"].equals(emp[\"bonus_vec\"]))\n",
      "python": {
        "files": {
          "main.py": "import pandas as pd\nimport numpy as np\n\nemp = pd.DataFrame({\n    \"name\": [\"Asha\", \"Vikram\", \"Neha\", \"Arjun\", \"Pooja\"],\n    \"salary\": [65000, 42000, 72000, 48000, 51000],\n    \"rating\": [5, 3, 4, 2, 3],\n})\n\ndef bonus_row(r):\n    if r[\"rating\"] >= 4:\n        return r[\"salary\"] * 0.20\n    elif r[\"rating\"] == 3:\n        return r[\"salary\"] * 0.10\n    return r[\"salary\"] * 0.05\n\nemp[\"bonus_apply\"] = emp.apply(bonus_row, axis=1)\nemp[\"bonus_vec\"] = emp[\"salary\"] * np.select(\n    [emp[\"rating\"] >= 4, emp[\"rating\"] == 3], [0.20, 0.10], default=0.05)\nemp[\"band\"] = np.where(emp[\"salary\"] >= 50000, \"Senior\", \"Junior\")\nprint(emp)\nprint(\"Same result:\", emp[\"bonus_apply\"].equals(emp[\"bonus_vec\"]))\n"
        }
      },
      "result": "     name  salary  rating  bonus_apply  bonus_vec    band\n0    Asha   65000       5      13000.0    13000.0  Senior\n1  Vikram   42000       3       4200.0     4200.0  Junior\n2    Neha   72000       4      14400.0    14400.0  Senior\n3   Arjun   48000       2       2400.0     2400.0  Junior\n4   Pooja   51000       3       5100.0     5100.0  Senior\nSame result: True",
      "explanation": "apply(axis=1) passes each row as a Series to bonus_row - easy to read but it loops in Python. np.select builds a rate array for all rows at once and multiplies it with salary in a single vectorized step. Both give identical results, but the vectorized version scales to millions of rows. np.where handles the simple two-way case."
    },
    {
      "title": "Timing: apply vs Vectorized on 200,000 Rows",
      "scenario": "Measure how much faster vectorized code is than apply on a realistic number of orders.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import pandas as pd\nimport numpy as np\nimport time\n\nrng = np.random.default_rng(0)\nn = 200_000\ndf = pd.DataFrame({\"price\": rng.integers(100, 5000, n), \"qty\": rng.integers(1, 10, n)})\n\nt0 = time.perf_counter()\na = df.apply(lambda r: r[\"price\"] * r[\"qty\"], axis=1)\nt_apply = time.perf_counter() - t0\n\nt0 = time.perf_counter()\nv = df[\"price\"] * df[\"qty\"]\nt_vec = time.perf_counter() - t0\n\nprint(\"Equal:\", a.equals(v))\nprint(\"Vectorized faster:\", t_vec < t_apply)\nprint(\"Speed-up more than 10x:\", t_apply / t_vec > 10)\n",
      "python": {
        "files": {
          "main.py": "import pandas as pd\nimport numpy as np\nimport time\n\nrng = np.random.default_rng(0)\nn = 200_000\ndf = pd.DataFrame({\"price\": rng.integers(100, 5000, n), \"qty\": rng.integers(1, 10, n)})\n\nt0 = time.perf_counter()\na = df.apply(lambda r: r[\"price\"] * r[\"qty\"], axis=1)\nt_apply = time.perf_counter() - t0\n\nt0 = time.perf_counter()\nv = df[\"price\"] * df[\"qty\"]\nt_vec = time.perf_counter() - t0\n\nprint(\"Equal:\", a.equals(v))\nprint(\"Vectorized faster:\", t_vec < t_apply)\nprint(\"Speed-up more than 10x:\", t_apply / t_vec > 10)\n"
        }
      },
      "result": "Equal: True\nVectorized faster: True\nSpeed-up more than 10x: True",
      "explanation": "Both approaches give the same revenue column. apply(axis=1) creates a Series for every row and calls a Python function 200,000 times, while the vectorized multiplication runs once in C. Exact timings vary by machine, so we print comparisons; typically the speed-up is several hundred times."
    },
    {
      "title": "Binning Customers with cut and qcut",
      "scenario": "Group customers into age bands with fixed edges, and into spending quartiles (equal-sized groups) for a marketing campaign.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import pandas as pd\n\ncust = pd.DataFrame({\n    \"customer\": [\"A\", \"B\", \"C\", \"D\", \"E\", \"F\", \"G\", \"H\"],\n    \"age\": [22, 35, 41, 19, 58, 30, 26, 47],\n    \"spend\": [1200, 5400, 8800, 600, 15000, 3100, 2500, 9900],\n})\ncust[\"age_band\"] = pd.cut(cust[\"age\"], bins=[18, 25, 35, 50, 100],\n                          labels=[\"18-25\", \"26-35\", \"36-50\", \"50+\"])\ncust[\"spend_tier\"] = pd.qcut(cust[\"spend\"], q=4, labels=[\"Low\", \"Mid\", \"High\", \"Top\"])\nprint(cust)\nprint(cust[\"spend_tier\"].value_counts().sort_index())\nprint(cust.groupby(\"age_band\", observed=True)[\"spend\"].mean().round(0))\n",
      "python": {
        "files": {
          "main.py": "import pandas as pd\n\ncust = pd.DataFrame({\n    \"customer\": [\"A\", \"B\", \"C\", \"D\", \"E\", \"F\", \"G\", \"H\"],\n    \"age\": [22, 35, 41, 19, 58, 30, 26, 47],\n    \"spend\": [1200, 5400, 8800, 600, 15000, 3100, 2500, 9900],\n})\ncust[\"age_band\"] = pd.cut(cust[\"age\"], bins=[18, 25, 35, 50, 100],\n                          labels=[\"18-25\", \"26-35\", \"36-50\", \"50+\"])\ncust[\"spend_tier\"] = pd.qcut(cust[\"spend\"], q=4, labels=[\"Low\", \"Mid\", \"High\", \"Top\"])\nprint(cust)\nprint(cust[\"spend_tier\"].value_counts().sort_index())\nprint(cust.groupby(\"age_band\", observed=True)[\"spend\"].mean().round(0))\n"
        }
      },
      "result": "  customer  age  spend age_band spend_tier\n0        A   22   1200    18-25        Low\n1        B   35   5400    26-35       High\n2        C   41   8800    36-50       High\n3        D   19    600    18-25        Low\n4        E   58  15000      50+        Top\n5        F   30   3100    26-35        Mid\n6        G   26   2500    26-35        Mid\n7        H   47   9900    36-50        Top\nspend_tier\nLow     2\nMid     2\nHigh    2\nTop     2\nName: count, dtype: int64\nage_band\n18-25      900.0\n26-35     3667.0\n36-50     9350.0\n50+      15000.0\nName: spend, dtype: float64",
      "explanation": "cut uses the edges you give; intervals are right-inclusive, so 35 falls in (25, 35] = '26-35'. qcut splits by quartiles so each tier has 2 customers. Both return categorical columns that keep the logical order. observed=True in groupby shows only bands that actually contain data (and avoids a FutureWarning)."
    },
    {
      "title": "Memory Optimisation and a Clean Method Chain",
      "scenario": "Shrink a 100,000-row order table with category and downcasting, then build a monthly report in one readable chain.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import pandas as pd\nimport numpy as np\n\nrng = np.random.default_rng(5)\nn = 100_000\ndf = pd.DataFrame({\n    \"city\": rng.choice([\"Mumbai\", \"Pune\", \"Delhi\", \"Chennai\"], n),\n    \"status\": rng.choice([\"Delivered\", \"Returned\"], n, p=[0.9, 0.1]),\n    \"qty\": rng.integers(1, 6, n),\n    \"price\": rng.integers(100, 2000, n).astype(float),\n    \"date\": pd.Timestamp(\"2024-01-01\") + pd.to_timedelta(rng.integers(0, 90, n), unit=\"D\"),\n})\nbefore = df.memory_usage(deep=True).sum()\nsmall = df.astype({\"city\": \"category\", \"status\": \"category\"})\nsmall[\"qty\"] = pd.to_numeric(small[\"qty\"], downcast=\"integer\")\nsmall[\"price\"] = small[\"price\"].astype(\"float32\")\nafter = small.memory_usage(deep=True).sum()\nprint(f\"Memory reduced by {(1 - after / before) * 100:.0f}%\")\nprint(small.dtypes)\n\nreport = (\n    small.query(\"status == 'Delivered'\")\n         .assign(revenue=lambda d: d[\"qty\"] * d[\"price\"],\n                 month=lambda d: d[\"date\"].dt.to_period(\"M\"))\n         .groupby(\"month\", as_index=False)[\"revenue\"].sum()\n         .assign(revenue_lakh=lambda d: (d[\"revenue\"].astype(\"float64\") / 1e5).round(1))\n)\nprint(report[[\"month\", \"revenue_lakh\"]])\n",
      "python": {
        "files": {
          "main.py": "import pandas as pd\nimport numpy as np\n\nrng = np.random.default_rng(5)\nn = 100_000\ndf = pd.DataFrame({\n    \"city\": rng.choice([\"Mumbai\", \"Pune\", \"Delhi\", \"Chennai\"], n),\n    \"status\": rng.choice([\"Delivered\", \"Returned\"], n, p=[0.9, 0.1]),\n    \"qty\": rng.integers(1, 6, n),\n    \"price\": rng.integers(100, 2000, n).astype(float),\n    \"date\": pd.Timestamp(\"2024-01-01\") + pd.to_timedelta(rng.integers(0, 90, n), unit=\"D\"),\n})\nbefore = df.memory_usage(deep=True).sum()\nsmall = df.astype({\"city\": \"category\", \"status\": \"category\"})\nsmall[\"qty\"] = pd.to_numeric(small[\"qty\"], downcast=\"integer\")\nsmall[\"price\"] = small[\"price\"].astype(\"float32\")\nafter = small.memory_usage(deep=True).sum()\nprint(f\"Memory reduced by {(1 - after / before) * 100:.0f}%\")\nprint(small.dtypes)\n\nreport = (\n    small.query(\"status == 'Delivered'\")\n         .assign(revenue=lambda d: d[\"qty\"] * d[\"price\"],\n                 month=lambda d: d[\"date\"].dt.to_period(\"M\"))\n         .groupby(\"month\", as_index=False)[\"revenue\"].sum()\n         .assign(revenue_lakh=lambda d: (d[\"revenue\"].astype(\"float64\") / 1e5).round(1))\n)\nprint(report[[\"month\", \"revenue_lakh\"]])\n"
        }
      },
      "result": "Memory reduced by 89%\ncity            category\nstatus          category\nqty                 int8\nprice            float32\ndate      datetime64[ns]\ndtype: object\n     month  revenue_lakh\n0  2024-01         976.8\n1  2024-02         904.6\n2  2024-03         946.2",
      "explanation": "Text columns stored as object take a lot of memory because every string is a separate Python object; category stores each city once plus small integer codes. Downcasting qty to int8 and price to float32 saves more. The method chain filters delivered orders, adds revenue and month with assign (lambdas refer to the DataFrame at that step), groups and formats - no temporary variables needed."
    }
  ],
  "interview": [
    {
      "q": "What is the difference between map, apply and DataFrame.map (applymap)?",
      "a": "Series.map transforms each element using a dict, Series or function. Series.apply calls a function on each element (more flexible, can pass args). DataFrame.apply applies a function to each column (axis=0) or row (axis=1). DataFrame.map (applymap before 2.1) applies a function to every cell of a DataFrame.",
      "level": "Medium"
    },
    {
      "q": "Why is apply(axis=1) slow and what do you use instead?",
      "a": "It runs a Python function for each row and builds a Series per row - essentially a Python loop. Replace it with vectorized column arithmetic, np.where/np.select for conditions, .str/.dt accessors, map for lookups, or merge.",
      "level": "Medium"
    },
    {
      "q": "What happens to values not found in the dict when you use Series.map(dict)?",
      "a": "They become NaN. Use replace(dict) to keep unmatched values, or map(dict).fillna(original).",
      "level": "Easy"
    },
    {
      "q": "What is vectorization in pandas?",
      "a": "Performing operations on entire columns at once with functions implemented in C/NumPy, instead of iterating row by row in Python. It is faster and shorter, e.g. df['total'] = df['price'] * df['qty'].",
      "level": "Easy"
    },
    {
      "q": "Difference between pd.cut and pd.qcut?",
      "a": "cut bins values into intervals with specified edges or equal widths - bins can have very different counts. qcut bins by quantiles so each bin has (roughly) the same number of observations.",
      "level": "Medium"
    },
    {
      "q": "How do you reduce the memory usage of a DataFrame?",
      "a": "Convert low-cardinality strings to category, downcast numeric types (int64->int8/16/32, float64->float32), read only needed columns with usecols, specify dtypes at read time, drop unused columns, and use Parquet/Arrow formats.",
      "level": "Medium"
    },
    {
      "q": "Why should you avoid iterrows?",
      "a": "iterrows yields each row as a Series, which is slow (object creation per row) and does not preserve dtypes. If you must loop, itertuples is much faster; but prefer vectorized operations.",
      "level": "Medium"
    },
    {
      "q": "Write vectorized code to label orders 'High' if amount > 5000, 'Medium' if > 1000, else 'Low'.",
      "a": "np.select([df.amount > 5000, df.amount > 1000], ['High', 'Medium'], default='Low') or pd.cut(df.amount, [-np.inf, 1000, 5000, np.inf], labels=['Low', 'Medium', 'High']).",
      "level": "Medium"
    },
    {
      "q": "What is method chaining and why use assign?",
      "a": "Method chaining links pandas methods in one expression so the data flows step by step without temporary variables. assign adds columns and returns a new DataFrame, so it fits in a chain; with a lambda it refers to the intermediate DataFrame.",
      "level": "Hard"
    },
    {
      "q": "What does pipe() do?",
      "a": "df.pipe(func, *args) calls func(df, *args) and returns its result, letting you insert custom functions into a method chain: df.pipe(clean).pipe(add_features).",
      "level": "Hard"
    },
    {
      "q": "When is apply still a good choice?",
      "a": "For complex logic without a vectorized equivalent (calling an external parser, complicated text rules), small DataFrames where readability matters more than speed, or groupby().apply returning custom DataFrames per group.",
      "level": "Hard"
    }
  ],
  "practice": [
    {
      "task": "Map product codes ['P1', 'P2', 'P3', 'P4'] to names using a dictionary {'P1': 'Mouse', 'P2': 'Keyboard', 'P3': 'Monitor'} and fill unmapped codes with 'Unknown'.",
      "hint": "map(dict).fillna('Unknown')",
      "solution": "import pandas as pd\n\ns = pd.Series([\"P1\", \"P2\", \"P3\", \"P4\", \"P1\"])\nnames = {\"P1\": \"Mouse\", \"P2\": \"Keyboard\", \"P3\": \"Monitor\"}\nprint(s.map(names).fillna(\"Unknown\"))\n"
    },
    {
      "task": "Given student marks, add a 'result' column: 'Distinction' (>= 75), 'Pass' (>= 40) or 'Fail', first with apply and then with np.select. Confirm both are equal.",
      "hint": "Write a small function for apply; for np.select order conditions from highest.",
      "solution": "import pandas as pd\nimport numpy as np\n\ndf = pd.DataFrame({\"marks\": [82, 35, 67, 75, 40, 12]})\n\ndef result(m):\n    if m >= 75:\n        return \"Distinction\"\n    if m >= 40:\n        return \"Pass\"\n    return \"Fail\"\n\na = df[\"marks\"].apply(result)\nv = pd.Series(np.select([df[\"marks\"] >= 75, df[\"marks\"] >= 40], [\"Distinction\", \"Pass\"], default=\"Fail\"))\nprint(a.tolist())\nprint(a.equals(v))\n"
    },
    {
      "task": "Bin salaries [25000, 48000, 52000, 75000, 120000, 33000] into bands '<30k', '30-50k', '50-100k', '100k+' with pd.cut and count employees per band.",
      "hint": "bins=[0, 30000, 50000, 100000, float('inf')]",
      "solution": "import pandas as pd\n\ns = pd.Series([25000, 48000, 52000, 75000, 120000, 33000])\nbands = pd.cut(s, bins=[0, 30000, 50000, 100000, float(\"inf\")],\n               labels=[\"<30k\", \"30-50k\", \"50-100k\", \"100k+\"])\nprint(bands.value_counts().sort_index())\n"
    },
    {
      "task": "Create a 50,000-row DataFrame with a 'state' column of 5 repeated state names. Print memory usage (deep) before and after converting it to category.",
      "hint": "memory_usage(deep=True).sum()",
      "solution": "import pandas as pd\nimport numpy as np\n\nrng = np.random.default_rng(3)\ndf = pd.DataFrame({\"state\": rng.choice([\"MH\", \"KA\", \"TN\", \"DL\", \"GJ\"], 50_000)})\nprint(df.memory_usage(deep=True).sum())\ndf[\"state\"] = df[\"state\"].astype(\"category\")\nprint(df.memory_usage(deep=True).sum())\n"
    },
    {
      "task": "Rewrite this as one method chain: filter orders with qty > 0, add revenue = price * qty, group by city and sum revenue, sort descending.",
      "hint": "(df.query(...).assign(...).groupby(...)[...].sum().sort_values(...))",
      "solution": "import pandas as pd\n\ndf = pd.DataFrame({\"city\": [\"Pune\", \"Delhi\", \"Pune\", \"Mumbai\"],\n                   \"price\": [100, 250, 80, 400], \"qty\": [2, 1, 0, 3]})\nout = (df.query(\"qty > 0\")\n         .assign(revenue=lambda d: d[\"price\"] * d[\"qty\"])\n         .groupby(\"city\")[\"revenue\"].sum()\n         .sort_values(ascending=False))\nprint(out)\n"
    }
  ],
  "quiz": [
    {
      "question": "s.map({'a': 1}) for a value 'b' returns:",
      "options": [
        "'b'",
        "0",
        "NaN",
        "Error"
      ],
      "answer": 2,
      "explanation": "map returns NaN for keys missing from the dict."
    },
    {
      "question": "To apply a function to each ROW of a DataFrame you use:",
      "options": [
        "df.apply(f)",
        "df.apply(f, axis=1)",
        "df.map(f)",
        "df.agg(f)"
      ],
      "answer": 1,
      "explanation": "axis=1 passes each row to the function."
    },
    {
      "question": "Which is generally the fastest way to compute price * qty?",
      "options": [
        "iterrows loop",
        "apply(axis=1)",
        "df['price'] * df['qty']",
        "itertuples loop"
      ],
      "answer": 2,
      "explanation": "Vectorized column arithmetic runs in optimised C code."
    },
    {
      "question": "pd.qcut(s, 4) creates bins that have:",
      "options": [
        "Equal width",
        "Roughly equal counts",
        "Custom edges",
        "Only 2 values"
      ],
      "answer": 1,
      "explanation": "qcut uses quantiles, so each bin holds about 25% of values."
    },
    {
      "question": "Which dtype best reduces memory for a 'city' column with few unique values?",
      "options": [
        "object",
        "string",
        "category",
        "float64"
      ],
      "answer": 2,
      "explanation": "category stores unique labels once with integer codes."
    },
    {
      "question": "In pandas 2.1+, applymap was renamed to:",
      "options": [
        "DataFrame.apply",
        "DataFrame.map",
        "DataFrame.transform",
        "DataFrame.pipe"
      ],
      "answer": 1,
      "explanation": "DataFrame.map is the element-wise function for whole DataFrames."
    }
  ]
};
