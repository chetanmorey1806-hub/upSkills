export default {
  "id": "day-07-data-cleaning-missing-duplicates-outliers",
  "title": "Data Cleaning: Missing Values, Duplicates, dtypes, String Methods and Outliers",
  "module": "Module 2: Pandas",
  "day": 7,
  "level": "Intermediate",
  "duration": "3.5 hours",
  "summary": "Turn messy real-world data into analysis-ready data. Detect and handle missing values (dropna, fillna, group-wise fill, interpolate), remove duplicates, fix data types with astype/to_numeric/to_datetime, clean text with the .str accessor, and detect and treat outliers with the IQR and z-score methods.",
  "objectives": [
    "Find missing values with isna().sum() and decide between dropping and filling",
    "Fill missing values with constants, mean/median/mode, group-wise statistics and forward fill",
    "Find and remove duplicates with duplicated() and drop_duplicates(subset, keep)",
    "Convert columns to correct types with astype, pd.to_numeric(errors='coerce') and pd.to_datetime",
    "Clean text with str.strip, lower/title, replace, split and extract",
    "Detect outliers with IQR and z-score and treat them by removing or capping (clip)"
  ],
  "theory": [
    {
      "heading": "Why Data Cleaning Matters",
      "content": "Real data comes from forms, Excel sheets typed by people, multiple systems and old databases. It contains blanks, typos, the same customer twice, numbers stored as text and impossible values (age 250). If you analyse it as-is, totals, averages and charts will be wrong. A typical cleaning checklist:",
      "points": [
        "1. Inspect: shape, info(), head(), isna().sum(), duplicated().sum(), describe()",
        "2. Fix column names: strip spaces, lower case, use snake_case",
        "3. Fix data types (numbers, dates, categories)",
        "4. Handle missing values",
        "5. Remove duplicates",
        "6. Standardise text (spaces, capitalisation, spelling variants)",
        "7. Detect and treat outliers / invalid values",
        "8. Validate: re-check counts and totals against the source"
      ]
    },
    {
      "heading": "Missing Values: Detect and Drop",
      "content": "pandas represents missing values as `NaN` (numbers), `None`/`NaN` (objects) or `NaT` (dates). `isna()` (alias `isnull()`) returns True for missing cells. `dropna()` removes rows (or columns with axis=1) that contain missing values.",
      "syntax": "df.isna().sum()                 # missing per column\ndf.isna().mean() * 100          # % missing per column\ndf.dropna()                     # drop rows with ANY missing value\ndf.dropna(subset=['amount'])    # only if amount is missing\ndf.dropna(thresh=3)             # keep rows with at least 3 non-null values\ndf.dropna(axis=1, how='all')    # drop columns that are completely empty",
      "tip": "Never drop blindly. If 30% of rows have a missing 'phone' column, dropping rows loses 30% of your sales. Drop the column or fill it instead."
    },
    {
      "heading": "Missing Values: Fill (Impute)",
      "content": "Choose a fill strategy that makes business sense:",
      "points": [
        "Constant: `df['discount'].fillna(0)` (no discount recorded = 0), `fillna('Unknown')` for categories",
        "Mean / median: `fillna(df['age'].median())` - median is safer when there are outliers",
        "Mode for categories: `fillna(df['city'].mode()[0])`",
        "Group-wise: `df['salary'].fillna(df.groupby('dept')['salary'].transform('median'))` - fill using the employee's own department",
        "Time series: `ffill()` (carry the last value forward), `bfill()`, `interpolate()` (straight line between known points)",
        "Different values per column: `df.fillna({'discount': 0, 'city': 'Unknown'})`"
      ],
      "tip": "Add a flag column before filling (df['salary_missing'] = df['salary'].isna()) so you can later see how many values were imputed."
    },
    {
      "heading": "Duplicates",
      "content": "Duplicates appear when data is exported twice, merged badly or entered twice. `duplicated()` marks repeated rows (the first occurrence is False by default). `drop_duplicates()` removes them. Use `subset` to define what 'duplicate' means (e.g. same order_id) and `keep` to choose which copy survives.",
      "syntax": "df.duplicated().sum()                              # fully identical rows\ndf.duplicated(subset=['order_id']).sum()           # same order_id\ndf.drop_duplicates(subset=['order_id'], keep='last')\ndf[df.duplicated('email', keep=False)]             # show ALL copies"
    },
    {
      "heading": "Fixing Data Types",
      "content": "Numbers stored as text ('1,200', 'Rs 500', 'NA') cannot be summed, and dates stored as text cannot be sorted by time. Fix types early.",
      "syntax": "df['qty'] = df['qty'].astype(int)\ndf['price'] = pd.to_numeric(df['price'].str.replace(',', ''), errors='coerce')\ndf['order_date'] = pd.to_datetime(df['order_date'], format='%d-%m-%Y', errors='coerce')\ndf['city'] = df['city'].astype('category')\ndf['qty'] = df['qty'].astype('Int64')     # nullable integer, allows <NA>",
      "points": [
        "`errors='coerce'` turns invalid values into NaN/NaT instead of raising an error - then count them",
        "`category` dtype saves memory for repeated labels (city, gender, status)",
        "`dayfirst=True` for Indian date formats like 05/04/2024 meaning 5 April"
      ]
    },
    {
      "heading": "Cleaning Text with the .str Accessor",
      "content": "Every text column has a `.str` accessor with vectorized string methods that skip NaN automatically.",
      "points": [
        "`str.strip()`, `lstrip()`, `rstrip()` - remove spaces",
        "`str.lower()`, `upper()`, `title()` - standardise case",
        "`str.replace('old', 'new')`, `str.replace(r'\\D', '', regex=True)` - remove non-digits",
        "`str.split('-', expand=True)` - split into multiple columns",
        "`str.extract(r'(\\d+)')` - pull a pattern out with regex",
        "`str.len()`, `str.contains()`, `str.startswith()`, `str[:3]` - slice and test",
        "`df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')` - clean column names"
      ]
    },
    {
      "heading": "Outliers: Detect and Treat",
      "content": "An outlier is a value far from the others. Some are errors (age 250, negative quantity), some are real but rare (one bulk order of 5 lakh). Detect, investigate, then decide.",
      "points": [
        "**IQR method**: Q1 = 25th percentile, Q3 = 75th, IQR = Q3 - Q1. Outliers are < Q1 - 1.5*IQR or > Q3 + 1.5*IQR. Works for skewed data",
        "**Z-score method**: z = (x - mean) / std; |z| > 3 is an outlier. Assumes roughly normal data",
        "**Business rules**: age between 18 and 65, quantity > 0, discount <= 100%",
        "Treatment: remove the row, cap with `clip(lower, upper)` (winsorising), replace with median, or keep and report separately",
        "Visual check: box plot and histogram (Days 12-13)"
      ]
    }
  ],
  "examples": [
    {
      "title": "Inspecting and Handling Missing Values",
      "scenario": "An employee table has missing salaries, cities and joining bonus. Count them, then fill each column with a sensible strategy.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import pandas as pd\nimport numpy as np\n\nemp = pd.DataFrame({\n    \"name\": [\"Asha\", \"Vikram\", \"Neha\", \"Arjun\", \"Pooja\", \"Ravi\", \"Kiran\"],\n    \"dept\": [\"IT\", \"HR\", \"IT\", \"Sales\", \"Sales\", \"IT\", \"HR\"],\n    \"salary\": [65000, np.nan, 72000, 48000, np.nan, 58000, 45000],\n    \"city\": [\"Pune\", \"Mumbai\", None, \"Delhi\", \"Pune\", None, \"Mumbai\"],\n    \"bonus\": [5000, np.nan, 7000, np.nan, 3000, 4000, np.nan],\n})\nprint(emp.isna().sum())\nprint(\"Rows with any missing:\", emp.isna().any(axis=1).sum())\n\nemp[\"salary\"] = emp[\"salary\"].fillna(emp.groupby(\"dept\")[\"salary\"].transform(\"median\"))\nemp[\"city\"] = emp[\"city\"].fillna(\"Unknown\")\nemp[\"bonus\"] = emp[\"bonus\"].fillna(0)\nprint(emp)\nprint(\"Missing after cleaning:\", emp.isna().sum().sum())\n",
      "python": {
        "files": {
          "main.py": "import pandas as pd\nimport numpy as np\n\nemp = pd.DataFrame({\n    \"name\": [\"Asha\", \"Vikram\", \"Neha\", \"Arjun\", \"Pooja\", \"Ravi\", \"Kiran\"],\n    \"dept\": [\"IT\", \"HR\", \"IT\", \"Sales\", \"Sales\", \"IT\", \"HR\"],\n    \"salary\": [65000, np.nan, 72000, 48000, np.nan, 58000, 45000],\n    \"city\": [\"Pune\", \"Mumbai\", None, \"Delhi\", \"Pune\", None, \"Mumbai\"],\n    \"bonus\": [5000, np.nan, 7000, np.nan, 3000, 4000, np.nan],\n})\nprint(emp.isna().sum())\nprint(\"Rows with any missing:\", emp.isna().any(axis=1).sum())\n\nemp[\"salary\"] = emp[\"salary\"].fillna(emp.groupby(\"dept\")[\"salary\"].transform(\"median\"))\nemp[\"city\"] = emp[\"city\"].fillna(\"Unknown\")\nemp[\"bonus\"] = emp[\"bonus\"].fillna(0)\nprint(emp)\nprint(\"Missing after cleaning:\", emp.isna().sum().sum())\n"
        }
      },
      "result": "name      0\ndept      0\nsalary    2\ncity      2\nbonus     3\ndtype: int64\nRows with any missing: 6\n     name   dept   salary     city   bonus\n0    Asha     IT  65000.0     Pune  5000.0\n1  Vikram     HR  45000.0   Mumbai     0.0\n2    Neha     IT  72000.0  Unknown  7000.0\n3   Arjun  Sales  48000.0    Delhi     0.0\n4   Pooja  Sales  48000.0     Pune  3000.0\n5    Ravi     IT  58000.0  Unknown  4000.0\n6   Kiran     HR  45000.0   Mumbai     0.0\nMissing after cleaning: 0",
      "explanation": "isna().sum() counts blanks per column. Salary is filled with the median of the employee's own department using groupby().transform(), so Vikram (HR) gets 45,000 and Pooja (Sales) gets 48,000 - more realistic than a single company-wide average. Missing cities become 'Unknown' and missing bonus becomes 0 because no bonus was recorded."
    },
    {
      "title": "Removing Duplicate Orders",
      "scenario": "An order export was appended twice and one order was updated later. Find exact duplicates and keep only the latest version of each order_id.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import pandas as pd\n\norders = pd.DataFrame({\n    \"order_id\": [501, 502, 503, 502, 504, 503],\n    \"customer\": [\"Amit\", \"Sara\", \"John\", \"Sara\", \"Priya\", \"John\"],\n    \"amount\": [1200, 850, 2300, 850, 640, 2500],\n})\nprint(\"Exact duplicate rows:\", orders.duplicated().sum())\nprint(\"Duplicate order_ids:\", orders.duplicated(subset=\"order_id\").sum())\nprint(orders[orders.duplicated(\"order_id\", keep=False)].sort_values(\"order_id\"))\n\nlatest = orders.drop_duplicates(subset=\"order_id\", keep=\"last\")\nprint(latest.sort_values(\"order_id\").reset_index(drop=True))\nprint(\"Total before:\", orders[\"amount\"].sum(), \"after:\", latest[\"amount\"].sum())\n",
      "python": {
        "files": {
          "main.py": "import pandas as pd\n\norders = pd.DataFrame({\n    \"order_id\": [501, 502, 503, 502, 504, 503],\n    \"customer\": [\"Amit\", \"Sara\", \"John\", \"Sara\", \"Priya\", \"John\"],\n    \"amount\": [1200, 850, 2300, 850, 640, 2500],\n})\nprint(\"Exact duplicate rows:\", orders.duplicated().sum())\nprint(\"Duplicate order_ids:\", orders.duplicated(subset=\"order_id\").sum())\nprint(orders[orders.duplicated(\"order_id\", keep=False)].sort_values(\"order_id\"))\n\nlatest = orders.drop_duplicates(subset=\"order_id\", keep=\"last\")\nprint(latest.sort_values(\"order_id\").reset_index(drop=True))\nprint(\"Total before:\", orders[\"amount\"].sum(), \"after:\", latest[\"amount\"].sum())\n"
        }
      },
      "result": "Exact duplicate rows: 1\nDuplicate order_ids: 2\n   order_id customer  amount\n1       502     Sara     850\n3       502     Sara     850\n2       503     John    2300\n5       503     John    2500\n   order_id customer  amount\n0       501     Amit    1200\n1       502     Sara     850\n2       503     John    2500\n3       504    Priya     640\nTotal before: 8340 after: 5190",
      "explanation": "Row 3 is an exact copy of row 1, so duplicated() finds 1. By order_id there are 2 duplicates (502 and 503), because order 503 appears with two different amounts. keep=False shows all copies for review. keep='last' keeps the most recent version (503 -> 2500). Without de-duplication, revenue would be overstated by 3,150."
    },
    {
      "title": "Fixing Messy Numbers and Dates",
      "scenario": "Prices arrive as text with commas and 'Rs', quantities contain 'NA', and dates are in Indian dd-mm-yyyy format with one invalid date.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import pandas as pd\n\nraw = pd.DataFrame({\n    \"price\": [\"Rs 1,200\", \"850\", \"Rs 2,499\", \"free\", \"Rs 640\"],\n    \"qty\": [\"2\", \"1\", \"NA\", \"3\", \"5\"],\n    \"order_date\": [\"05-04-2024\", \"12-04-2024\", \"31-04-2024\", \"01-05-2024\", \"15-05-2024\"],\n})\nprint(raw.dtypes)\n\ndf = raw.copy()\ndf[\"price\"] = pd.to_numeric(df[\"price\"].str.replace(r\"[^0-9.]\", \"\", regex=True),\n                            errors=\"coerce\")\ndf[\"qty\"] = pd.to_numeric(df[\"qty\"], errors=\"coerce\").astype(\"Int64\")\ndf[\"order_date\"] = pd.to_datetime(df[\"order_date\"], format=\"%d-%m-%Y\", errors=\"coerce\")\nprint(df)\nprint(df.dtypes)\nprint(\"Invalid values:\", df.isna().sum().to_dict())\n",
      "python": {
        "files": {
          "main.py": "import pandas as pd\n\nraw = pd.DataFrame({\n    \"price\": [\"Rs 1,200\", \"850\", \"Rs 2,499\", \"free\", \"Rs 640\"],\n    \"qty\": [\"2\", \"1\", \"NA\", \"3\", \"5\"],\n    \"order_date\": [\"05-04-2024\", \"12-04-2024\", \"31-04-2024\", \"01-05-2024\", \"15-05-2024\"],\n})\nprint(raw.dtypes)\n\ndf = raw.copy()\ndf[\"price\"] = pd.to_numeric(df[\"price\"].str.replace(r\"[^0-9.]\", \"\", regex=True),\n                            errors=\"coerce\")\ndf[\"qty\"] = pd.to_numeric(df[\"qty\"], errors=\"coerce\").astype(\"Int64\")\ndf[\"order_date\"] = pd.to_datetime(df[\"order_date\"], format=\"%d-%m-%Y\", errors=\"coerce\")\nprint(df)\nprint(df.dtypes)\nprint(\"Invalid values:\", df.isna().sum().to_dict())\n"
        }
      },
      "result": "price         object\nqty           object\norder_date    object\ndtype: object\n    price   qty order_date\n0  1200.0     2 2024-04-05\n1   850.0     1 2024-04-12\n2  2499.0  <NA>        NaT\n3     NaN     3 2024-05-01\n4   640.0     5 2024-05-15\nprice                float64\nqty                    Int64\norder_date    datetime64[ns]\ndtype: object\nInvalid values: {'price': 1, 'qty': 1, 'order_date': 1}",
      "explanation": "A regex replace removes everything except digits and dots; to_numeric with errors='coerce' turns 'free' (now an empty string) into NaN instead of crashing. 'NA' in qty becomes <NA> and the nullable Int64 type keeps the column as integers. 31-04-2024 is not a real date (April has 30 days), so it becomes NaT. Counting the NaN/NaT values tells you exactly how many records need follow-up."
    },
    {
      "title": "Standardising Text Columns",
      "scenario": "Customer data typed by different sales staff has inconsistent spaces, case and phone formats, and a full name that needs splitting.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import pandas as pd\n\ncust = pd.DataFrame({\n    \" Full Name \": [\"  amit SHARMA\", \"Sara khan \", \"JOHN d'souza\", \"priya  nair\"],\n    \"City\": [\"mumbai\", \" Mumbai\", \"PUNE\", \"bengaluru \"],\n    \"Phone\": [\"+91-98765 43210\", \"9876501234\", \"(91) 99887-76655\", \"98200 11223\"],\n})\ncust.columns = cust.columns.str.strip().str.lower().str.replace(\" \", \"_\")\ncust[\"full_name\"] = cust[\"full_name\"].str.strip().str.replace(r\"\\s+\", \" \", regex=True).str.title()\ncust[\"city\"] = cust[\"city\"].str.strip().str.title()\ncust[\"phone\"] = cust[\"phone\"].str.replace(r\"\\D\", \"\", regex=True).str[-10:]\ncust[[\"first\", \"last\"]] = cust[\"full_name\"].str.split(\" \", n=1, expand=True)\nprint(cust)\nprint(cust[\"city\"].value_counts())\n",
      "python": {
        "files": {
          "main.py": "import pandas as pd\n\ncust = pd.DataFrame({\n    \" Full Name \": [\"  amit SHARMA\", \"Sara khan \", \"JOHN d'souza\", \"priya  nair\"],\n    \"City\": [\"mumbai\", \" Mumbai\", \"PUNE\", \"bengaluru \"],\n    \"Phone\": [\"+91-98765 43210\", \"9876501234\", \"(91) 99887-76655\", \"98200 11223\"],\n})\ncust.columns = cust.columns.str.strip().str.lower().str.replace(\" \", \"_\")\ncust[\"full_name\"] = cust[\"full_name\"].str.strip().str.replace(r\"\\s+\", \" \", regex=True).str.title()\ncust[\"city\"] = cust[\"city\"].str.strip().str.title()\ncust[\"phone\"] = cust[\"phone\"].str.replace(r\"\\D\", \"\", regex=True).str[-10:]\ncust[[\"first\", \"last\"]] = cust[\"full_name\"].str.split(\" \", n=1, expand=True)\nprint(cust)\nprint(cust[\"city\"].value_counts())\n"
        }
      },
      "result": "      full_name       city       phone  first     last\n0   Amit Sharma     Mumbai  9876543210   Amit   Sharma\n1     Sara Khan     Mumbai  9876501234   Sara     Khan\n2  John D'Souza       Pune  9988776655   John  D'Souza\n3    Priya Nair  Bengaluru  9820011223  Priya     Nair\ncity\nMumbai       2\nPune         1\nBengaluru    1\nName: count, dtype: int64",
      "explanation": "Column names are cleaned first. strip removes outer spaces, the regex \\s+ collapses double spaces and title() fixes capitalisation (it gives \"D'Souza\" for names with apostrophes). Removing all non-digits (\\D) and keeping the last 10 characters gives a clean 10-digit mobile number. split with expand=True creates two columns. After cleaning, ' Mumbai' and 'mumbai' are counted together."
    },
    {
      "title": "Detecting and Capping Outliers (IQR and Z-score)",
      "scenario": "Order values include one data-entry error (9,99,999) and one genuine bulk order. Detect them with IQR and z-score and cap extreme values.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import pandas as pd\n\ns = pd.Series([420, 510, 380, 450, 600, 530, 470, 999999, 495, 15000, 440, 520],\n              name=\"order_value\")\nq1, q3 = s.quantile([0.25, 0.75])\niqr = q3 - q1\nlow, high = q1 - 1.5 * iqr, q3 + 1.5 * iqr\nprint(f\"Q1={q1}, Q3={q3}, IQR={iqr}, bounds=({low}, {high})\")\nprint(\"IQR outliers:\", s[(s < low) | (s > high)].tolist())\n\nz = (s - s.mean()) / s.std()\nprint(\"Z-score outliers (|z|>3):\", s[z.abs() > 3].tolist())\n\ncapped = s.clip(lower=low, upper=high)\nprint(\"Mean before:\", round(s.mean(), 1), \"after capping:\", round(capped.mean(), 1))\nprint(\"Median (robust):\", s.median())\n",
      "python": {
        "files": {
          "main.py": "import pandas as pd\n\ns = pd.Series([420, 510, 380, 450, 600, 530, 470, 999999, 495, 15000, 440, 520],\n              name=\"order_value\")\nq1, q3 = s.quantile([0.25, 0.75])\niqr = q3 - q1\nlow, high = q1 - 1.5 * iqr, q3 + 1.5 * iqr\nprint(f\"Q1={q1}, Q3={q3}, IQR={iqr}, bounds=({low}, {high})\")\nprint(\"IQR outliers:\", s[(s < low) | (s > high)].tolist())\n\nz = (s - s.mean()) / s.std()\nprint(\"Z-score outliers (|z|>3):\", s[z.abs() > 3].tolist())\n\ncapped = s.clip(lower=low, upper=high)\nprint(\"Mean before:\", round(s.mean(), 1), \"after capping:\", round(capped.mean(), 1))\nprint(\"Median (robust):\", s.median())\n"
        }
      },
      "result": "Q1=447.5, Q3=547.5, IQR=100.0, bounds=(297.5, 697.5)\nIQR outliers: [999999, 15000]\nZ-score outliers (|z|>3): [999999]\nMean before: 84984.5 after capping: 517.5\nMedian (robust): 502.5",
      "explanation": "IQR flags both 999999 and 15000. The z-score method flags only 999999 - the huge error inflates the mean and std so much that 15000 looks normal. This is why IQR is preferred for skewed business data. clip caps extreme values at the bounds (winsorising), bringing the mean close to the median. In practice, investigate 15000 before treating it: it may be a genuine bulk order."
    }
  ],
  "interview": [
    {
      "q": "How do you find missing values in a DataFrame?",
      "a": "df.isna().sum() gives missing counts per column, df.isna().mean()*100 gives percentages, df.isna().any(axis=1).sum() counts rows with any missing value, and df.info() shows non-null counts.",
      "level": "Easy"
    },
    {
      "q": "When would you drop missing values and when would you fill them?",
      "a": "Drop when few rows are affected (e.g. <5%) and they are random, or when the missing column is the key (e.g. no order_id). Fill when dropping would lose too much data or bias results; choose median for skewed numbers, mode/'Unknown' for categories, 0 when missing logically means zero, ffill/interpolate for time series, group-wise statistics when groups differ.",
      "level": "Medium"
    },
    {
      "q": "Why is median imputation often better than mean imputation?",
      "a": "The median is not affected by outliers or skew. With salaries or order values, a few very large values pull the mean up, so filling with the mean would inflate typical values.",
      "level": "Easy"
    },
    {
      "q": "How do you fill missing values with the mean of each group?",
      "a": "df['salary'] = df['salary'].fillna(df.groupby('dept')['salary'].transform('mean')). transform returns a Series aligned to the original rows, so each NaN gets its own group's mean.",
      "level": "Medium"
    },
    {
      "q": "Difference between duplicated() and drop_duplicates()?",
      "a": "duplicated() returns a boolean Series marking repeated rows (by default first occurrence = False). drop_duplicates() returns the DataFrame with duplicates removed. Both accept subset= and keep='first'|'last'|False.",
      "level": "Easy"
    },
    {
      "q": "What does errors='coerce' do in pd.to_numeric / pd.to_datetime?",
      "a": "Values that cannot be converted become NaN (or NaT for dates) instead of raising an error. After conversion, count the NaNs to see how many bad values exist.",
      "level": "Medium"
    },
    {
      "q": "How do you detect outliers? Compare IQR and z-score.",
      "a": "IQR: values outside [Q1 - 1.5*IQR, Q3 + 1.5*IQR]; uses quartiles so it is robust and works for skewed data. Z-score: |(x - mean)/std| > 3; assumes approximate normality and is itself distorted by extreme outliers (masking). Also use box plots and domain rules.",
      "level": "Medium"
    },
    {
      "q": "How do you treat outliers?",
      "a": "First investigate whether they are errors or genuine. Errors: correct or remove. Genuine extremes: keep but analyse separately, cap/winsorise with clip(), use robust statistics (median, IQR) or transform (log). Document the decision.",
      "level": "Medium"
    },
    {
      "q": "What is the difference between NaN, None, NaT and pd.NA?",
      "a": "NaN is the floating-point 'not a number' used for missing numeric values. None is Python's null object, which pandas treats as missing in object columns (and converts to NaN in numeric columns). NaT (Not a Time) is the missing value for datetime columns. pd.NA is the newer missing marker used by nullable dtypes like Int64 and string.",
      "level": "Hard"
    },
    {
      "q": "How would you clean column names with spaces and mixed case?",
      "a": "df.columns = df.columns.str.strip().str.lower().str.replace(r'\\s+', '_', regex=True). Or use df.rename(columns=str.lower) for a simple function.",
      "level": "Easy"
    },
    {
      "q": "A numeric column shows dtype object. What could be the reasons and how do you fix it?",
      "a": "It contains non-numeric entries like '1,200', 'Rs 500', 'NA', '-', spaces, or mixed types from Excel. Inspect with s[pd.to_numeric(s, errors='coerce').isna()], clean with str.replace, then convert with pd.to_numeric(errors='coerce') and check new NaNs.",
      "level": "Medium"
    },
    {
      "q": "When would you use ffill or interpolate?",
      "a": "For ordered data like time series: ffill carries the last known value forward (stock price on a holiday, last known status); interpolate estimates values between known points (temperature, daily sensor readings). Sort by date first.",
      "level": "Hard"
    }
  ],
  "practice": [
    {
      "task": "Given a product table with missing price and category, fill price with the median price of its category and category with 'Misc'. Print missing counts before and after.",
      "hint": "Fill price first using groupby('category')['price'].transform('median'); fill anything left with the overall median.",
      "solution": "import pandas as pd\nimport numpy as np\n\ndf = pd.DataFrame({\n    \"product\": [\"Pen\", \"Pencil\", \"Mug\", \"Plate\", \"Tape\", \"Bowl\"],\n    \"category\": [\"Stationery\", \"Stationery\", \"Kitchen\", None, \"Stationery\", \"Kitchen\"],\n    \"price\": [20, np.nan, 250, 180, 35, np.nan],\n})\nprint(df.isna().sum())\ndf[\"price\"] = df[\"price\"].fillna(df.groupby(\"category\")[\"price\"].transform(\"median\"))\ndf[\"price\"] = df[\"price\"].fillna(df[\"price\"].median())\ndf[\"category\"] = df[\"category\"].fillna(\"Misc\")\nprint(df)\nprint(df.isna().sum())\n"
    },
    {
      "task": "A student registration list has repeated emails with different capitalisation (e.g. 'Riya@Gmail.com' and 'riya@gmail.com '). Normalise the emails and keep the first registration per email.",
      "hint": "str.strip().str.lower() then drop_duplicates(subset='email').",
      "solution": "import pandas as pd\n\ndf = pd.DataFrame({\n    \"name\": [\"Riya\", \"Riya\", \"Om\", \"Tara\"],\n    \"email\": [\"Riya@Gmail.com\", \"riya@gmail.com \", \"om@yahoo.com\", \"tara@gmail.com\"],\n})\ndf[\"email\"] = df[\"email\"].str.strip().str.lower()\nclean = df.drop_duplicates(subset=\"email\", keep=\"first\")\nprint(clean)\n"
    },
    {
      "task": "Convert a 'salary' column like ['45,000', '52000', 'NA', '61,500'] to numbers and a 'join_date' column like ['01/02/2023', '15/07/2022', 'unknown', '30/11/2021'] (day first) to dates. Print dtypes and number of invalid values.",
      "hint": "pd.to_numeric(s.str.replace(',', ''), errors='coerce'); pd.to_datetime(..., format='%d/%m/%Y', errors='coerce')",
      "solution": "import pandas as pd\n\ndf = pd.DataFrame({\n    \"salary\": [\"45,000\", \"52000\", \"NA\", \"61,500\"],\n    \"join_date\": [\"01/02/2023\", \"15/07/2022\", \"unknown\", \"30/11/2021\"],\n})\ndf[\"salary\"] = pd.to_numeric(df[\"salary\"].str.replace(\",\", \"\"), errors=\"coerce\")\ndf[\"join_date\"] = pd.to_datetime(df[\"join_date\"], format=\"%d/%m/%Y\", errors=\"coerce\")\nprint(df.dtypes)\nprint(df.isna().sum())\n"
    },
    {
      "task": "For delivery times in minutes [32, 28, 35, 41, 30, 29, 250, 33, 38, 5], find outliers with the IQR rule and replace them with the median.",
      "hint": "Compute bounds, build a mask, then s.mask(mask, s.median()).",
      "solution": "import pandas as pd\n\ns = pd.Series([32, 28, 35, 41, 30, 29, 250, 33, 38, 5])\nq1, q3 = s.quantile([0.25, 0.75])\niqr = q3 - q1\nmask = (s < q1 - 1.5 * iqr) | (s > q3 + 1.5 * iqr)\nprint(\"Outliers:\", s[mask].tolist())\nprint(s.mask(mask, s.median()).tolist())\n"
    },
    {
      "task": "Split a 'location' column with values like 'Mumbai - Maharashtra' into city and state columns, trimming spaces, and count customers per state.",
      "hint": "str.split('-', n=1, expand=True) then str.strip() on each part.",
      "solution": "import pandas as pd\n\ndf = pd.DataFrame({\"location\": [\"Mumbai - Maharashtra\", \"Pune-Maharashtra\",\n                                \"Chennai - Tamil Nadu\", \"Indore - Madhya Pradesh\"]})\nparts = df[\"location\"].str.split(\"-\", n=1, expand=True)\ndf[\"city\"] = parts[0].str.strip()\ndf[\"state\"] = parts[1].str.strip()\nprint(df)\nprint(df[\"state\"].value_counts())\n"
    }
  ],
  "quiz": [
    {
      "question": "Which returns the number of missing values per column?",
      "options": [
        "df.isna().count()",
        "df.isna().sum()",
        "df.dropna().sum()",
        "df.null()"
      ],
      "answer": 1,
      "explanation": "isna() gives True for missing cells and sum() counts the Trues per column."
    },
    {
      "question": "What does drop_duplicates(subset='id', keep='last') do?",
      "options": [
        "Removes all rows with duplicate ids",
        "Keeps the last occurrence of each id",
        "Keeps the first occurrence",
        "Removes the last row"
      ],
      "answer": 1,
      "explanation": "keep='last' retains the last row for each duplicated id."
    },
    {
      "question": "pd.to_numeric(['10', 'abc'], errors='coerce') returns:",
      "options": [
        "Error",
        "[10, 'abc']",
        "[10.0, NaN]",
        "[10, 0]"
      ],
      "answer": 2,
      "explanation": "Invalid values become NaN, so the result is float."
    },
    {
      "question": "Using the IQR rule, a value is an outlier if it is greater than:",
      "options": [
        "Q3 + IQR",
        "Q3 + 1.5 * IQR",
        "mean + 1.5 * std",
        "Q2 + 1.5 * IQR"
      ],
      "answer": 1,
      "explanation": "The standard upper fence is Q3 + 1.5 * IQR."
    },
    {
      "question": "Which method fills NaN with the previous valid value?",
      "options": [
        "bfill()",
        "ffill()",
        "interpolate()",
        "fillna(0)"
      ],
      "answer": 1,
      "explanation": "ffill (forward fill) propagates the last valid observation forward."
    },
    {
      "question": "Which pandas dtype allows integers with missing values?",
      "options": [
        "int64",
        "Int64",
        "float32",
        "object"
      ],
      "answer": 1,
      "explanation": "The nullable Int64 (capital I) dtype uses pd.NA for missing values."
    }
  ]
};
