export default {
  "id": "day-05-pandas-series-dataframe-csv-excel",
  "title": "Pandas Series and DataFrame Basics, Reading and Writing CSV and Excel",
  "module": "Module 2: Pandas",
  "day": 5,
  "level": "Beginner",
  "duration": "3 hours",
  "summary": "Meet pandas, the most important library for a data analyst. Create Series and DataFrames, understand the index, inspect data with head, info, describe and value_counts, add and remove columns, sort, and read/write CSV and Excel files with the most useful options.",
  "objectives": [
    "Create a Series and a DataFrame from lists, dicts and NumPy arrays",
    "Explain the index, columns and dtypes of a DataFrame",
    "Explore data with head, tail, shape, info, describe, value_counts and nunique",
    "Add, rename, drop and sort columns and rows",
    "Read and write CSV and Excel files using sep, usecols, dtype, parse_dates, sheet_name and index=False"
  ],
  "theory": [
    {
      "heading": "What is pandas?",
      "content": "pandas is an open-source library for working with tables of data in Python. If NumPy is a calculator for arrays, pandas is **Excel + SQL inside Python**. It adds labels (column names and row index), mixed column types, missing-value handling, and hundreds of functions to load, clean, reshape, group and export data.\n\npandas has two main objects: **Series** (one column) and **DataFrame** (a whole table).",
      "syntax": "pip install pandas openpyxl\n\nimport pandas as pd\nprint(pd.__version__)",
      "tip": "pandas 2.x is the current major version used in most companies. It is built on NumPy and can optionally use PyArrow for faster strings."
    },
    {
      "heading": "Series: a Labelled Column",
      "content": "A Series is a 1D array of values with an **index** (labels). By default the index is 0, 1, 2 ... but you can use meaningful labels such as product names or dates. You can build a Series from a list, a dict (keys become the index) or a NumPy array. A Series supports vectorized maths, just like NumPy, and aligns on the index when combined with another Series.",
      "syntax": "price = pd.Series([499, 1299, 799], index=['Mouse', 'Keyboard', 'Headset'], name='price')\nprice['Keyboard']     # 1299\nprice * 1.18          # vectorized\nprice[price > 500]    # boolean filter\nprice.mean(), price.max(), price.idxmax()"
    },
    {
      "heading": "DataFrame: a Table of Series",
      "content": "A DataFrame is a 2D table where each column is a Series sharing the same row index. The most common way to create one is from a dictionary of lists (each key is a column) or from a list of dictionaries (each dict is a row, like JSON from an API).",
      "syntax": "df = pd.DataFrame({\n    'emp': ['Asha', 'Vikram', 'Neha'],\n    'dept': ['IT', 'HR', 'IT'],\n    'salary': [65000, 42000, 72000],\n})\nrows = [{'emp': 'Asha', 'salary': 65000}, {'emp': 'Ravi', 'salary': 50000}]\npd.DataFrame(rows)",
      "points": [
        "`df.columns` - column labels; `df.index` - row labels",
        "`df['salary']` returns a Series; `df[['emp', 'salary']]` (double brackets) returns a DataFrame",
        "`df.dtypes` - type of each column (int64, float64, object for text, datetime64, bool, category)",
        "`df.set_index('emp')` makes a column the index; `df.reset_index()` turns it back into a column"
      ]
    },
    {
      "heading": "Exploring a DataFrame (First 5 Minutes with Any Dataset)",
      "content": "Whenever you load new data, run these commands to understand it before any analysis.",
      "points": [
        "`df.head(n)` / `df.tail(n)` / `df.sample(n)` - look at rows",
        "`df.shape` - (rows, columns)",
        "`df.info()` - column names, non-null counts, dtypes and memory (spot missing values and wrong types)",
        "`df.describe()` - count, mean, std, min, quartiles, max for numeric columns; `describe(include='object')` for text",
        "`df['col'].value_counts()` - frequency of each category (add normalize=True for %)",
        "`df['col'].unique()` / `nunique()` - distinct values / how many",
        "`df.isna().sum()` - missing values per column"
      ]
    },
    {
      "heading": "Adding, Renaming, Dropping and Sorting",
      "content": "Create a new column by assignment - the calculation is vectorized over all rows. `rename` changes labels, `drop` removes rows or columns, and `sort_values` sorts by one or more columns. Most methods return a NEW DataFrame; assign the result back (`df = df.drop(...)`). Avoid `inplace=True` - it is discouraged in modern pandas.",
      "syntax": "df['bonus'] = df['salary'] * 0.10\ndf = df.assign(total=df['salary'] + df['bonus'])\ndf = df.rename(columns={'emp': 'employee'})\ndf = df.drop(columns=['bonus'])\ndf = df.sort_values(['dept', 'salary'], ascending=[True, False])\ndf.insert(0, 'emp_id', [101, 102, 103])"
    },
    {
      "heading": "Reading and Writing CSV",
      "content": "`pd.read_csv` is the function you will use most. It accepts a file path, a URL or a file-like object and has many useful options. `df.to_csv` writes a DataFrame back to disk.",
      "syntax": "df = pd.read_csv('sales.csv',\n                 sep=',',               # ';' or '\\t' for other formats\n                 usecols=['date', 'city', 'amount'],\n                 dtype={'city': 'category'},\n                 parse_dates=['date'],\n                 na_values=['NA', '-', ''],\n                 nrows=1000,            # read only first 1000 rows\n                 encoding='utf-8')\n\ndf.to_csv('clean_sales.csv', index=False)",
      "points": [
        "Always pass `index=False` to to_csv unless the index has meaning, otherwise an extra 'Unnamed: 0' column appears when you read it back",
        "For very large files use `chunksize=100_000` to read in pieces",
        "If you see garbled characters (e.g. the rupee sign), try `encoding='latin-1'` or `'utf-8-sig'`"
      ]
    },
    {
      "heading": "Reading and Writing Excel",
      "content": "pandas reads and writes .xlsx files through the **openpyxl** engine (pip install openpyxl). `sheet_name` can be a name, a position, a list, or None to read ALL sheets into a dictionary of DataFrames. To write several sheets into one workbook use `pd.ExcelWriter`.",
      "syntax": "df = pd.read_excel('report.xlsx', sheet_name='Sales', skiprows=2, usecols='A:D')\nall_sheets = pd.read_excel('report.xlsx', sheet_name=None)   # dict\n\nwith pd.ExcelWriter('summary.xlsx') as writer:\n    sales.to_excel(writer, sheet_name='Sales', index=False)\n    summary.to_excel(writer, sheet_name='Summary', index=False)",
      "tip": "In Google Colab, upload the file first or read it from Drive. Reading Excel is much slower than CSV - for big data ask for CSV exports."
    }
  ],
  "examples": [
    {
      "title": "Creating and Using a Series",
      "scenario": "Store product prices with product names as the index, then filter, compute GST and find the most expensive item.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import pandas as pd\n\nprice = pd.Series([499, 1299, 799, 2499],\n                  index=[\"Mouse\", \"Keyboard\", \"Headset\", \"Webcam\"],\n                  name=\"price\")\nprint(price)\nprint(\"Keyboard:\", price[\"Keyboard\"])\nprint(\"Above 700:\")\nprint(price[price > 700])\nprint(\"With GST:\", (price * 1.18).round(2).tolist())\nprint(\"Costliest:\", price.idxmax(), price.max())\n\nstock = pd.Series({\"Mouse\": 40, \"Webcam\": 5, \"Keyboard\": 12})\nprint((price * stock).dropna())\n",
      "python": {
        "files": {
          "main.py": "import pandas as pd\n\nprice = pd.Series([499, 1299, 799, 2499],\n                  index=[\"Mouse\", \"Keyboard\", \"Headset\", \"Webcam\"],\n                  name=\"price\")\nprint(price)\nprint(\"Keyboard:\", price[\"Keyboard\"])\nprint(\"Above 700:\")\nprint(price[price > 700])\nprint(\"With GST:\", (price * 1.18).round(2).tolist())\nprint(\"Costliest:\", price.idxmax(), price.max())\n\nstock = pd.Series({\"Mouse\": 40, \"Webcam\": 5, \"Keyboard\": 12})\nprint((price * stock).dropna())\n"
        }
      },
      "result": "Mouse        499\nKeyboard    1299\nHeadset      799\nWebcam      2499\nName: price, dtype: int64\nKeyboard: 1299\nAbove 700:\nKeyboard    1299\nHeadset      799\nWebcam      2499\nName: price, dtype: int64\nWith GST: [588.82, 1532.82, 942.82, 2948.82]\nCostliest: Webcam 2499\nKeyboard    15588.0\nMouse       19960.0\nWebcam      12495.0\ndtype: float64",
      "explanation": "The index makes values accessible by label. Boolean filtering and arithmetic work like NumPy. idxmax returns the label of the largest value. When two Series are multiplied, pandas aligns them by index label (not position): Headset has no stock value, so its result is NaN, which dropna removes. Note the result becomes float because NaN is a float."
    },
    {
      "title": "Building and Exploring an Employee DataFrame",
      "scenario": "Create an employee table and run the standard first-look commands an analyst uses on any new dataset.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import pandas as pd\n\ndf = pd.DataFrame({\n    \"emp_id\": [101, 102, 103, 104, 105, 106],\n    \"name\": [\"Asha\", \"Vikram\", \"Neha\", \"Arjun\", \"Pooja\", \"Ravi\"],\n    \"dept\": [\"IT\", \"HR\", \"IT\", \"Sales\", \"Sales\", \"IT\"],\n    \"salary\": [65000, 42000, 72000, 48000, 51000, 58000],\n    \"exp_years\": [5, 3, 8, 2, 4, 6],\n})\nprint(df.head(3))\nprint(df.shape)\ndf.info()\nprint(df.describe().round(1))\nprint(df[\"dept\"].value_counts())\nprint(\"Departments:\", df[\"dept\"].nunique())\n",
      "python": {
        "files": {
          "main.py": "import pandas as pd\n\ndf = pd.DataFrame({\n    \"emp_id\": [101, 102, 103, 104, 105, 106],\n    \"name\": [\"Asha\", \"Vikram\", \"Neha\", \"Arjun\", \"Pooja\", \"Ravi\"],\n    \"dept\": [\"IT\", \"HR\", \"IT\", \"Sales\", \"Sales\", \"IT\"],\n    \"salary\": [65000, 42000, 72000, 48000, 51000, 58000],\n    \"exp_years\": [5, 3, 8, 2, 4, 6],\n})\nprint(df.head(3))\nprint(df.shape)\ndf.info()\nprint(df.describe().round(1))\nprint(df[\"dept\"].value_counts())\nprint(\"Departments:\", df[\"dept\"].nunique())\n"
        }
      },
      "result": "   emp_id    name dept  salary  exp_years\n0     101    Asha   IT   65000          5\n1     102  Vikram   HR   42000          3\n2     103    Neha   IT   72000          8\n(6, 5)\n<class 'pandas.core.frame.DataFrame'>\nRangeIndex: 6 entries, 0 to 5\nData columns (total 5 columns):\n #   Column     Non-Null Count  Dtype \n---  ------     --------------  ----- \n 0   emp_id     6 non-null      int64 \n 1   name       6 non-null      object\n 2   dept       6 non-null      object\n 3   salary     6 non-null      int64 \n 4   exp_years  6 non-null      int64 \ndtypes: int64(3), object(2)\nmemory usage: 372.0+ bytes\n       emp_id   salary  exp_years\ncount     6.0      6.0        6.0\nmean    103.5  56000.0        4.7\nstd       1.9  11189.3        2.2\nmin     101.0  42000.0        2.0\n25%     102.2  48750.0        3.2\n50%     103.5  54500.0        4.5\n75%     104.8  63250.0        5.8\nmax     106.0  72000.0        8.0\ndept\nIT       3\nSales    2\nHR       1\nName: count, dtype: int64\nDepartments: 3",
      "explanation": "head shows the first rows, shape the size, and info() lists every column with its non-null count and dtype (text columns are object). describe() summarises numeric columns: for salary the mean is 56,000 and the median (50%) is 54,500. value_counts shows IT has 3 employees. These few commands answer 'what does this data look like?' in seconds."
    },
    {
      "title": "Adding, Renaming, Dropping and Sorting Columns",
      "scenario": "Prepare an e-commerce order table for a report: add revenue and GST, rename columns, drop a helper column and sort by revenue.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import pandas as pd\n\norders = pd.DataFrame({\n    \"order_id\": [5001, 5002, 5003, 5004],\n    \"product\": [\"Shoes\", \"T-shirt\", \"Watch\", \"Bag\"],\n    \"unit_price\": [2499, 599, 4999, 1499],\n    \"qty\": [1, 3, 1, 2],\n})\norders[\"revenue\"] = orders[\"unit_price\"] * orders[\"qty\"]\norders = orders.assign(gst=(orders[\"revenue\"] * 0.18).round(2))\norders = orders.rename(columns={\"qty\": \"quantity\"})\norders.insert(1, \"city\", [\"Pune\", \"Delhi\", \"Mumbai\", \"Pune\"])\nprint(orders)\nreport = (orders.drop(columns=[\"unit_price\"])\n                .sort_values(\"revenue\", ascending=False)\n                .reset_index(drop=True))\nprint(report)\n",
      "python": {
        "files": {
          "main.py": "import pandas as pd\n\norders = pd.DataFrame({\n    \"order_id\": [5001, 5002, 5003, 5004],\n    \"product\": [\"Shoes\", \"T-shirt\", \"Watch\", \"Bag\"],\n    \"unit_price\": [2499, 599, 4999, 1499],\n    \"qty\": [1, 3, 1, 2],\n})\norders[\"revenue\"] = orders[\"unit_price\"] * orders[\"qty\"]\norders = orders.assign(gst=(orders[\"revenue\"] * 0.18).round(2))\norders = orders.rename(columns={\"qty\": \"quantity\"})\norders.insert(1, \"city\", [\"Pune\", \"Delhi\", \"Mumbai\", \"Pune\"])\nprint(orders)\nreport = (orders.drop(columns=[\"unit_price\"])\n                .sort_values(\"revenue\", ascending=False)\n                .reset_index(drop=True))\nprint(report)\n"
        }
      },
      "result": "   order_id    city  product  unit_price  quantity  revenue     gst\n0      5001    Pune    Shoes        2499         1     2499  449.82\n1      5002   Delhi  T-shirt         599         3     1797  323.46\n2      5003  Mumbai    Watch        4999         1     4999  899.82\n3      5004    Pune      Bag        1499         2     2998  539.64\n   order_id    city  product  quantity  revenue     gst\n0      5003  Mumbai    Watch         1     4999  899.82\n1      5004    Pune      Bag         2     2998  539.64\n2      5001    Pune    Shoes         1     2499  449.82\n3      5002   Delhi  T-shirt         3     1797  323.46",
      "explanation": "New columns are created with vectorized arithmetic. assign returns a new DataFrame with the extra column, which is handy in method chains. insert places a column at a chosen position. drop removes a column, sort_values orders rows by revenue (highest first), and reset_index(drop=True) renumbers rows 0, 1, 2 ... after sorting."
    },
    {
      "title": "Writing and Reading a CSV File",
      "scenario": "Save daily sales to CSV, then read it back with parsed dates, selected columns and custom missing-value markers.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import pandas as pd\n\nsales = pd.DataFrame({\n    \"date\": [\"2024-04-01\", \"2024-04-02\", \"2024-04-03\", \"2024-04-04\"],\n    \"city\": [\"Mumbai\", \"Pune\", \"Delhi\", \"Mumbai\"],\n    \"amount\": [12500, \"-\", 9800, 15200],\n    \"remarks\": [\"ok\", \"system down\", \"ok\", \"festival\"],\n})\nsales.to_csv(\"sales.csv\", index=False)\n\nwith open(\"sales.csv\") as f:\n    print(f.read())\n\ndf = pd.read_csv(\"sales.csv\",\n                 usecols=[\"date\", \"city\", \"amount\"],\n                 parse_dates=[\"date\"],\n                 na_values=[\"-\"])\nprint(df)\nprint(df.dtypes)\nprint(\"Total amount:\", df[\"amount\"].sum())\n",
      "python": {
        "files": {
          "main.py": "import pandas as pd\n\nsales = pd.DataFrame({\n    \"date\": [\"2024-04-01\", \"2024-04-02\", \"2024-04-03\", \"2024-04-04\"],\n    \"city\": [\"Mumbai\", \"Pune\", \"Delhi\", \"Mumbai\"],\n    \"amount\": [12500, \"-\", 9800, 15200],\n    \"remarks\": [\"ok\", \"system down\", \"ok\", \"festival\"],\n})\nsales.to_csv(\"sales.csv\", index=False)\n\nwith open(\"sales.csv\") as f:\n    print(f.read())\n\ndf = pd.read_csv(\"sales.csv\",\n                 usecols=[\"date\", \"city\", \"amount\"],\n                 parse_dates=[\"date\"],\n                 na_values=[\"-\"])\nprint(df)\nprint(df.dtypes)\nprint(\"Total amount:\", df[\"amount\"].sum())\n"
        }
      },
      "result": "date,city,amount,remarks\n2024-04-01,Mumbai,12500,ok\n2024-04-02,Pune,-,system down\n2024-04-03,Delhi,9800,ok\n2024-04-04,Mumbai,15200,festival\n\n        date    city   amount\n0 2024-04-01  Mumbai  12500.0\n1 2024-04-02    Pune      NaN\n2 2024-04-03   Delhi   9800.0\n3 2024-04-04  Mumbai  15200.0\ndate      datetime64[ns]\ncity              object\namount           float64\ndtype: object\nTotal amount: 37500.0",
      "explanation": "to_csv with index=False writes only the real columns. When reading back, usecols skips the remarks column, parse_dates converts text to datetime64, and na_values=['-'] turns the dash into NaN so amount becomes a numeric float column. sum() ignores NaN by default. In the browser IDE the file is saved in a temporary virtual folder."
    },
    {
      "title": "Writing Multiple Sheets to Excel and Reading Them Back",
      "scenario": "Create a workbook with a Sales sheet and a Summary sheet (a common daily task), then read all sheets back into Python.",
      "steps": [
        "Run on your machine: pip install pandas openpyxl",
        "Save the code as main.py in an empty folder and run: python main.py",
        "Open the created Excel file to see the sheets"
      ],
      "code": "# pip install pandas openpyxl\nimport pandas as pd\n\nsales = pd.DataFrame({\n    \"region\": [\"North\", \"South\", \"North\", \"West\", \"South\"],\n    \"product\": [\"Laptop\", \"Phone\", \"Phone\", \"Laptop\", \"Tablet\"],\n    \"revenue\": [85000, 32000, 28000, 91000, 22000],\n})\nsummary = sales.groupby(\"region\", as_index=False)[\"revenue\"].sum()\n\nwith pd.ExcelWriter(\"sales_report.xlsx\") as writer:\n    sales.to_excel(writer, sheet_name=\"Sales\", index=False)\n    summary.to_excel(writer, sheet_name=\"Summary\", index=False)\n\nsheets = pd.read_excel(\"sales_report.xlsx\", sheet_name=None)\nprint(list(sheets.keys()))\nprint(sheets[\"Summary\"])\nfirst3 = pd.read_excel(\"sales_report.xlsx\", sheet_name=\"Sales\", usecols=\"A:C\", nrows=3)\nprint(first3)\n",
      "result": "['Sales', 'Summary']\n  region  revenue\n0  North   113000\n1  South    54000\n2   West    91000\n  region product  revenue\n0  North  Laptop    85000\n1  South   Phone    32000\n2  North   Phone    28000",
      "explanation": "ExcelWriter keeps one workbook open so several DataFrames can be written to different sheets. sheet_name=None reads every sheet into a dictionary {sheet name: DataFrame}. usecols='A:C' and nrows=3 work like selecting a range in Excel. (groupby is covered in detail on Day 8.) The openpyxl package is required for .xlsx files."
    }
  ],
  "interview": [
    {
      "q": "What is the difference between a Series and a DataFrame?",
      "a": "A Series is a one-dimensional labelled array (a single column with an index). A DataFrame is a two-dimensional labelled table made of multiple Series that share the same index. df['col'] returns a Series; df[['col']] returns a DataFrame.",
      "level": "Easy"
    },
    {
      "q": "What is the index in pandas and why is it useful?",
      "a": "The index holds row labels. It enables fast label-based lookups (loc), automatic alignment when combining Series/DataFrames, and is used by join, resample and plotting. It can be integers, strings, dates or a MultiIndex.",
      "level": "Easy"
    },
    {
      "q": "How do you check the structure of a new dataset quickly?",
      "a": "df.shape, df.head(), df.info() (dtypes and non-null counts), df.describe() (numeric stats), df.isna().sum() (missing values), df.nunique() and value_counts() on key categorical columns, and df.duplicated().sum().",
      "level": "Easy"
    },
    {
      "q": "What does df.describe() show? How do you describe text columns?",
      "a": "For numeric columns: count, mean, std, min, 25%, 50% (median), 75% and max. For text columns use df.describe(include='object') which shows count, unique, top (most frequent) and freq. include='all' shows both.",
      "level": "Easy"
    },
    {
      "q": "Why do we use index=False in to_csv?",
      "a": "Without it pandas writes the index as the first column. When the file is read again, that appears as an 'Unnamed: 0' column. index=False writes only the data columns.",
      "level": "Easy"
    },
    {
      "q": "How do you read only specific columns and parse dates in read_csv?",
      "a": "pd.read_csv('file.csv', usecols=['date', 'amount'], parse_dates=['date']). usecols reduces memory and parse_dates converts text to datetime64.",
      "level": "Medium"
    },
    {
      "q": "How would you read a 10 GB CSV file that does not fit in memory?",
      "a": "Use chunksize to process it in pieces: for chunk in pd.read_csv('big.csv', chunksize=500_000): aggregate each chunk and combine the results. Also reduce memory with usecols and smaller dtypes (category, int32, float32), or use tools like Polars, DuckDB or Dask.",
      "level": "Hard"
    },
    {
      "q": "How do you read all sheets of an Excel workbook?",
      "a": "pd.read_excel('file.xlsx', sheet_name=None) returns a dict of {sheet_name: DataFrame}. You can then pd.concat(dict.values()) if the sheets have the same columns.",
      "level": "Medium"
    },
    {
      "q": "What is the difference between inplace=True and assigning the result?",
      "a": "inplace=True modifies the object and returns None; assignment (df = df.drop(...)) returns a new object. inplace rarely saves memory, breaks method chaining, and the pandas team discourages it. Prefer assignment.",
      "level": "Medium"
    },
    {
      "q": "What happens when you add two Series with different indexes?",
      "a": "pandas aligns them by index label. Labels present in both are added; labels present in only one give NaN. Use s1.add(s2, fill_value=0) to treat missing labels as 0.",
      "level": "Medium"
    },
    {
      "q": "How do you create a DataFrame from a list of dictionaries (e.g. API JSON)?",
      "a": "pd.DataFrame(list_of_dicts) - each dict becomes a row and keys become columns; missing keys become NaN. For nested JSON use pd.json_normalize(data).",
      "level": "Medium"
    },
    {
      "q": "What is the 'object' dtype in pandas?",
      "a": "object means each value is a generic Python object - usually strings or mixed types. It is slower and uses more memory than numeric dtypes. pandas also has a dedicated 'string' dtype and 'category' dtype for repeated labels.",
      "level": "Medium"
    }
  ],
  "practice": [
    {
      "task": "Create a Series of 5 cities' monthly sales {'Mumbai': 120000, 'Delhi': 98000, 'Pune': 76000, 'Chennai': 88000, 'Kolkata': 65000}. Print cities with sales above 80,000, the total, and the city with the lowest sales.",
      "hint": "pd.Series(dict), boolean filter, sum(), idxmin()",
      "solution": "import pandas as pd\n\ns = pd.Series({\"Mumbai\": 120000, \"Delhi\": 98000, \"Pune\": 76000,\n               \"Chennai\": 88000, \"Kolkata\": 65000})\nprint(s[s > 80000])\nprint(\"Total:\", s.sum())\nprint(\"Lowest:\", s.idxmin())\n"
    },
    {
      "task": "Create a DataFrame of 5 students with columns name, maths, science, english. Add a total column and a percentage column (out of 300, 1 decimal), then sort by total descending and print the top 3.",
      "hint": "df['total'] = df[['maths', 'science', 'english']].sum(axis=1)",
      "solution": "import pandas as pd\n\ndf = pd.DataFrame({\n    \"name\": [\"Aarav\", \"Diya\", \"Kabir\", \"Meera\", \"Rohan\"],\n    \"maths\": [88, 92, 67, 75, 81],\n    \"science\": [79, 95, 72, 88, 64],\n    \"english\": [85, 89, 70, 91, 77],\n})\ndf[\"total\"] = df[[\"maths\", \"science\", \"english\"]].sum(axis=1)\ndf[\"percentage\"] = (df[\"total\"] / 300 * 100).round(1)\nprint(df.sort_values(\"total\", ascending=False).head(3))\n"
    },
    {
      "task": "Write a DataFrame of 4 products (product, category, price) to products.csv without the index. Read it back with category as dtype 'category' and print info().",
      "hint": "to_csv(index=False), read_csv(dtype={'category': 'category'})",
      "solution": "import pandas as pd\n\npd.DataFrame({\n    \"product\": [\"Pen\", \"Notebook\", \"Stapler\", \"Marker\"],\n    \"category\": [\"Stationery\", \"Stationery\", \"Office\", \"Office\"],\n    \"price\": [20, 60, 150, 45],\n}).to_csv(\"products.csv\", index=False)\ndf = pd.read_csv(\"products.csv\", dtype={\"category\": \"category\"})\ndf.info()\n"
    },
    {
      "task": "From a list of order dictionaries (order_id, customer, amount), build a DataFrame, rename amount to order_value, drop orders with order_value below 500, and save the result to an Excel file with sheet name 'BigOrders' (run locally with openpyxl).",
      "hint": "pd.DataFrame(list), rename, boolean filter, to_excel(sheet_name=...)",
      "solution": "import pandas as pd\n\norders = [\n    {\"order_id\": 1, \"customer\": \"Amit\", \"amount\": 1200},\n    {\"order_id\": 2, \"customer\": \"Sara\", \"amount\": 350},\n    {\"order_id\": 3, \"customer\": \"John\", \"amount\": 780},\n]\ndf = pd.DataFrame(orders).rename(columns={\"amount\": \"order_value\"})\ndf = df[df[\"order_value\"] >= 500]\nprint(df)\n# df.to_excel(\"big_orders.xlsx\", sheet_name=\"BigOrders\", index=False)  # needs openpyxl\n"
    }
  ],
  "quiz": [
    {
      "question": "What does df[['name']] return?",
      "options": [
        "A Series",
        "A DataFrame",
        "A list",
        "A NumPy array"
      ],
      "answer": 1,
      "explanation": "Double brackets pass a list of columns, which returns a DataFrame."
    },
    {
      "question": "Which method shows column dtypes and non-null counts?",
      "options": [
        "df.describe()",
        "df.info()",
        "df.head()",
        "df.shape"
      ],
      "answer": 1,
      "explanation": "info() lists each column with its non-null count and dtype, plus memory usage."
    },
    {
      "question": "Which parameter of read_csv converts a text column to datetime?",
      "options": [
        "dtype",
        "parse_dates",
        "usecols",
        "na_values"
      ],
      "answer": 1,
      "explanation": "parse_dates=['col'] parses those columns as datetime64."
    },
    {
      "question": "What does pd.read_excel('f.xlsx', sheet_name=None) return?",
      "options": [
        "The first sheet",
        "An error",
        "A dict of all sheets",
        "A list of sheet names"
      ],
      "answer": 2,
      "explanation": "sheet_name=None reads every sheet into a dict keyed by sheet name."
    },
    {
      "question": "Which package is needed to write .xlsx files with pandas?",
      "options": [
        "xlrd only",
        "openpyxl",
        "csv",
        "matplotlib"
      ],
      "answer": 1,
      "explanation": "openpyxl is the default engine for reading and writing .xlsx files."
    },
    {
      "question": "s.value_counts(normalize=True) returns:",
      "options": [
        "Counts",
        "Proportions of each value",
        "Unique values",
        "Sorted values"
      ],
      "answer": 1,
      "explanation": "normalize=True returns relative frequencies that sum to 1."
    }
  ]
};
