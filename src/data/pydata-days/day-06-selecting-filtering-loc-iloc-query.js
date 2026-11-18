export default {
  "id": "day-06-selecting-filtering-loc-iloc-query",
  "title": "Selecting and Filtering Data: loc, iloc, query, isin and between",
  "module": "Module 2: Pandas",
  "day": 6,
  "level": "Intermediate",
  "duration": "3 hours",
  "summary": "Master the ways to pick rows and columns in pandas: column selection, label-based loc, position-based iloc, at/iat, boolean filters with multiple conditions, isin, between, str.contains, query and nlargest. Learn to update values safely with loc and avoid the SettingWithCopyWarning.",
  "objectives": [
    "Select one or many columns and slice rows",
    "Use loc (labels) and iloc (positions) correctly, including their different slice rules",
    "Filter rows with boolean conditions combined with &, | and ~",
    "Use isin, between, str.contains, query, nlargest and nsmallest",
    "Update subsets with df.loc[mask, col] = value and avoid chained assignment"
  ],
  "theory": [
    {
      "heading": "Selecting Columns",
      "content": "Single brackets with one name return a Series; a list of names returns a DataFrame with those columns in that order. Dot access (`df.city`) also works but fails for names with spaces or names that clash with methods (like `df.count`), so prefer brackets in real code.",
      "syntax": "df['city']                     # Series\ndf[['customer', 'amount']]     # DataFrame\ndf.filter(like='amt')          # columns whose name contains 'amt'\ndf.select_dtypes('number')     # only numeric columns"
    },
    {
      "heading": "loc: Label-Based Selection",
      "content": "`df.loc[rows, columns]` selects by **labels** - index labels for rows and column names for columns. Row selectors can be a single label, a list of labels, a slice of labels or a boolean mask. Important: label slices INCLUDE the end label.",
      "syntax": "df.loc[3]                          # row with index label 3\ndf.loc[2:4]                        # labels 2, 3 AND 4 (inclusive)\ndf.loc[[0, 5], ['customer', 'amount']]\ndf.loc[df['amount'] > 10000, 'customer']\ndf.loc[:, 'city':'amount']         # column range by name",
      "tip": "If the index is set to names (df.set_index('customer')), loc lets you write df.loc['Amit', 'amount'] - like VLOOKUP by key."
    },
    {
      "heading": "iloc: Position-Based Selection",
      "content": "`df.iloc[rows, columns]` selects by integer **position** (0-based), exactly like NumPy. Slices EXCLUDE the end position. Use iloc when you care about position - first 5 rows, last column - regardless of labels.",
      "syntax": "df.iloc[0]            # first row\ndf.iloc[-1]           # last row\ndf.iloc[2:4]          # positions 2 and 3 only\ndf.iloc[:3, [1, 4]]   # first 3 rows, 2nd and 5th columns\ndf.iat[0, 4]          # single scalar, fastest\ndf.at[0, 'amount']    # single scalar by label",
      "points": [
        "loc slice 2:4 -> 3 rows (inclusive); iloc slice 2:4 -> 2 rows (exclusive)",
        "After sorting or filtering, labels and positions differ - choose deliberately",
        "at / iat are faster than loc / iloc for one cell"
      ]
    },
    {
      "heading": "Boolean Filtering",
      "content": "A condition on a column produces a boolean Series; passing it inside `df[...]` keeps the True rows. Combine conditions with `&` (and), `|` (or) and `~` (not), wrapping each condition in parentheses. This is the pandas version of SQL WHERE and Excel AutoFilter.",
      "syntax": "df[df['amount'] > 10000]\ndf[(df['city'] == 'Mumbai') & (df['status'] == 'Delivered')]\ndf[(df['category'] == 'Home') | (df['amount'] < 2000)]\ndf[~(df['status'] == 'Cancelled')]"
    },
    {
      "heading": "isin, between and String Filters",
      "content": "These helpers make filters shorter and more readable.",
      "points": [
        "`df['city'].isin(['Mumbai', 'Pune'])` - like SQL IN; `~...isin(...)` for NOT IN",
        "`df['amount'].between(5000, 20000)` - inclusive on both ends by default (`inclusive='both'|'left'|'right'|'neither'`)",
        "`df['customer'].str.startswith('S')`, `.str.contains('ar', case=False)` - text filters like SQL LIKE",
        "`df['col'].isna()` / `.notna()` - filter missing or present values",
        "`df.nlargest(3, 'amount')` / `df.nsmallest(3, 'amount')` - top-N rows"
      ]
    },
    {
      "heading": "query(): SQL-like Filtering",
      "content": "`df.query('expression')` filters with a readable string. Column names are used directly, `and`/`or`/`not` work, and you reference Python variables with `@`. Column names with spaces need backticks.",
      "syntax": "df.query('amount > 10000 and city == \"Mumbai\"')\nmin_amt = 5000\ndf.query('amount >= @min_amt and status != \"Cancelled\"')\ndf.query('city in [\"Pune\", \"Delhi\"]')\ndf.query('`order value` > 100')     # column with space"
    },
    {
      "heading": "Updating Values Safely and SettingWithCopyWarning",
      "content": "To change values in a subset, use a single `loc` call: `df.loc[mask, 'col'] = value`. Chained indexing like `df[df['city'] == 'Pune']['amount'] = 0` may modify a temporary copy instead of the original - pandas shows **SettingWithCopyWarning** and the change is lost. When you create a filtered subset you plan to modify, call `.copy()`.\n\nIn pandas 3.0, Copy-on-Write becomes the default: chained assignment never updates the original, so learning the `loc` pattern now makes your code future-proof.",
      "syntax": "df.loc[df['status'] == 'Returned', 'amount'] = 0      # correct\nsub = df[df['city'] == 'Pune'].copy()                   # independent subset\nsub['amount'] = sub['amount'] * 1.1                     # no warning"
    }
  ],
  "examples": [
    {
      "title": "loc vs iloc on an Orders Table",
      "scenario": "Pick rows and columns from an e-commerce order table by label and by position, and see the different slice rules.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import pandas as pd\n\norders = pd.DataFrame({\n    \"order_id\": [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008],\n    \"customer\": [\"Amit\", \"Sara\", \"John\", \"Priya\", \"Rahul\", \"Sneha\", \"Karan\", \"Divya\"],\n    \"city\": [\"Mumbai\", \"Pune\", \"Delhi\", \"Mumbai\", \"Chennai\", \"Pune\", \"Delhi\", \"Mumbai\"],\n    \"category\": [\"Electronics\", \"Fashion\", \"Electronics\", \"Home\", \"Fashion\",\n                 \"Electronics\", \"Home\", \"Fashion\"],\n    \"amount\": [45000, 2300, 18500, 7600, 1200, 32000, 5400, 3900],\n    \"status\": [\"Delivered\", \"Returned\", \"Delivered\", \"Delivered\", \"Cancelled\",\n               \"Delivered\", \"Delivered\", \"Returned\"],\n})\n\nprint(orders.loc[2:4, [\"customer\", \"amount\"]])      # labels 2..4 inclusive\nprint(orders.iloc[2:4, [1, 4]])                     # positions 2..3\nprint(\"First row city:\", orders.iloc[0][\"city\"])\nprint(\"Last order:\", orders.iloc[-1][\"order_id\"])\nprint(\"at:\", orders.at[5, \"amount\"], \"iat:\", orders.iat[5, 4])\n\nby_cust = orders.set_index(\"customer\")\nprint(by_cust.loc[\"Priya\", \"amount\"])\nprint(by_cust.loc[[\"Amit\", \"Karan\"], \"city\":\"amount\"])\n",
      "python": {
        "files": {
          "main.py": "import pandas as pd\n\norders = pd.DataFrame({\n    \"order_id\": [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008],\n    \"customer\": [\"Amit\", \"Sara\", \"John\", \"Priya\", \"Rahul\", \"Sneha\", \"Karan\", \"Divya\"],\n    \"city\": [\"Mumbai\", \"Pune\", \"Delhi\", \"Mumbai\", \"Chennai\", \"Pune\", \"Delhi\", \"Mumbai\"],\n    \"category\": [\"Electronics\", \"Fashion\", \"Electronics\", \"Home\", \"Fashion\",\n                 \"Electronics\", \"Home\", \"Fashion\"],\n    \"amount\": [45000, 2300, 18500, 7600, 1200, 32000, 5400, 3900],\n    \"status\": [\"Delivered\", \"Returned\", \"Delivered\", \"Delivered\", \"Cancelled\",\n               \"Delivered\", \"Delivered\", \"Returned\"],\n})\n\nprint(orders.loc[2:4, [\"customer\", \"amount\"]])      # labels 2..4 inclusive\nprint(orders.iloc[2:4, [1, 4]])                     # positions 2..3\nprint(\"First row city:\", orders.iloc[0][\"city\"])\nprint(\"Last order:\", orders.iloc[-1][\"order_id\"])\nprint(\"at:\", orders.at[5, \"amount\"], \"iat:\", orders.iat[5, 4])\n\nby_cust = orders.set_index(\"customer\")\nprint(by_cust.loc[\"Priya\", \"amount\"])\nprint(by_cust.loc[[\"Amit\", \"Karan\"], \"city\":\"amount\"])\n"
        }
      },
      "result": "  customer  amount\n2     John   18500\n3    Priya    7600\n4    Rahul    1200\n  customer  amount\n2     John   18500\n3    Priya    7600\nFirst row city: Mumbai\nLast order: 1008\nat: 32000 iat: 32000\n7600\n            city     category  amount\ncustomer                             \nAmit      Mumbai  Electronics   45000\nKaran      Delhi         Home    5400",
      "explanation": "loc[2:4] includes label 4, so three rows come back, while iloc[2:4] stops before position 4 and returns two. at/iat fetch a single value. After set_index('customer'), loc works like a lookup by customer name, and a column slice 'city':'amount' includes both ends."
    },
    {
      "title": "Boolean Filters with Multiple Conditions",
      "scenario": "The manager asks: (1) delivered orders above 10,000; (2) orders from Mumbai OR in Fashion; (3) everything except cancelled orders.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import pandas as pd\n\norders = pd.DataFrame({\n    \"order_id\": [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008],\n    \"customer\": [\"Amit\", \"Sara\", \"John\", \"Priya\", \"Rahul\", \"Sneha\", \"Karan\", \"Divya\"],\n    \"city\": [\"Mumbai\", \"Pune\", \"Delhi\", \"Mumbai\", \"Chennai\", \"Pune\", \"Delhi\", \"Mumbai\"],\n    \"category\": [\"Electronics\", \"Fashion\", \"Electronics\", \"Home\", \"Fashion\",\n                 \"Electronics\", \"Home\", \"Fashion\"],\n    \"amount\": [45000, 2300, 18500, 7600, 1200, 32000, 5400, 3900],\n    \"status\": [\"Delivered\", \"Returned\", \"Delivered\", \"Delivered\", \"Cancelled\",\n               \"Delivered\", \"Delivered\", \"Returned\"],\n})\n\nbig_delivered = orders[(orders[\"amount\"] > 10000) & (orders[\"status\"] == \"Delivered\")]\nprint(big_delivered[[\"customer\", \"amount\"]])\n\nmumbai_or_fashion = orders[(orders[\"city\"] == \"Mumbai\") | (orders[\"category\"] == \"Fashion\")]\nprint(mumbai_or_fashion[\"customer\"].tolist())\n\nnot_cancelled = orders[~(orders[\"status\"] == \"Cancelled\")]\nprint(len(orders), \"->\", len(not_cancelled))\nprint(\"Revenue of delivered:\", orders.loc[orders[\"status\"] == \"Delivered\", \"amount\"].sum())\n",
      "python": {
        "files": {
          "main.py": "import pandas as pd\n\norders = pd.DataFrame({\n    \"order_id\": [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008],\n    \"customer\": [\"Amit\", \"Sara\", \"John\", \"Priya\", \"Rahul\", \"Sneha\", \"Karan\", \"Divya\"],\n    \"city\": [\"Mumbai\", \"Pune\", \"Delhi\", \"Mumbai\", \"Chennai\", \"Pune\", \"Delhi\", \"Mumbai\"],\n    \"category\": [\"Electronics\", \"Fashion\", \"Electronics\", \"Home\", \"Fashion\",\n                 \"Electronics\", \"Home\", \"Fashion\"],\n    \"amount\": [45000, 2300, 18500, 7600, 1200, 32000, 5400, 3900],\n    \"status\": [\"Delivered\", \"Returned\", \"Delivered\", \"Delivered\", \"Cancelled\",\n               \"Delivered\", \"Delivered\", \"Returned\"],\n})\n\nbig_delivered = orders[(orders[\"amount\"] > 10000) & (orders[\"status\"] == \"Delivered\")]\nprint(big_delivered[[\"customer\", \"amount\"]])\n\nmumbai_or_fashion = orders[(orders[\"city\"] == \"Mumbai\") | (orders[\"category\"] == \"Fashion\")]\nprint(mumbai_or_fashion[\"customer\"].tolist())\n\nnot_cancelled = orders[~(orders[\"status\"] == \"Cancelled\")]\nprint(len(orders), \"->\", len(not_cancelled))\nprint(\"Revenue of delivered:\", orders.loc[orders[\"status\"] == \"Delivered\", \"amount\"].sum())\n"
        }
      },
      "result": "  customer  amount\n0     Amit   45000\n2     John   18500\n5    Sneha   32000\n['Amit', 'Sara', 'Priya', 'Rahul', 'Divya']\n8 -> 7\nRevenue of delivered: 108500",
      "explanation": "Each condition is wrapped in parentheses and combined with & or |. ~ negates a mask. Using loc[mask, 'amount'] filters rows and selects a column in one step, so we can sum only delivered revenue (45000 + 18500 + 7600 + 32000 + 5400 = 108,500)."
    },
    {
      "title": "isin, between, str methods and nlargest",
      "scenario": "Find orders from western cities, mid-range orders, customers whose names contain 'ra', and the top 3 orders.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import pandas as pd\n\norders = pd.DataFrame({\n    \"order_id\": [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008],\n    \"customer\": [\"Amit\", \"Sara\", \"John\", \"Priya\", \"Rahul\", \"Sneha\", \"Karan\", \"Divya\"],\n    \"city\": [\"Mumbai\", \"Pune\", \"Delhi\", \"Mumbai\", \"Chennai\", \"Pune\", \"Delhi\", \"Mumbai\"],\n    \"category\": [\"Electronics\", \"Fashion\", \"Electronics\", \"Home\", \"Fashion\",\n                 \"Electronics\", \"Home\", \"Fashion\"],\n    \"amount\": [45000, 2300, 18500, 7600, 1200, 32000, 5400, 3900],\n    \"status\": [\"Delivered\", \"Returned\", \"Delivered\", \"Delivered\", \"Cancelled\",\n               \"Delivered\", \"Delivered\", \"Returned\"],\n})\n\nwest = orders[orders[\"city\"].isin([\"Mumbai\", \"Pune\"])]\nprint(\"West:\", west[\"order_id\"].tolist())\nprint(\"Not west:\", orders.loc[~orders[\"city\"].isin([\"Mumbai\", \"Pune\"]), \"city\"].unique())\n\nmid = orders[orders[\"amount\"].between(3000, 20000)]\nprint(mid[[\"customer\", \"amount\"]])\n\nprint(orders[orders[\"customer\"].str.contains(\"ra\", case=False)][\"customer\"].tolist())\nprint(orders.nlargest(3, \"amount\")[[\"customer\", \"amount\"]])\n",
      "python": {
        "files": {
          "main.py": "import pandas as pd\n\norders = pd.DataFrame({\n    \"order_id\": [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008],\n    \"customer\": [\"Amit\", \"Sara\", \"John\", \"Priya\", \"Rahul\", \"Sneha\", \"Karan\", \"Divya\"],\n    \"city\": [\"Mumbai\", \"Pune\", \"Delhi\", \"Mumbai\", \"Chennai\", \"Pune\", \"Delhi\", \"Mumbai\"],\n    \"category\": [\"Electronics\", \"Fashion\", \"Electronics\", \"Home\", \"Fashion\",\n                 \"Electronics\", \"Home\", \"Fashion\"],\n    \"amount\": [45000, 2300, 18500, 7600, 1200, 32000, 5400, 3900],\n    \"status\": [\"Delivered\", \"Returned\", \"Delivered\", \"Delivered\", \"Cancelled\",\n               \"Delivered\", \"Delivered\", \"Returned\"],\n})\n\nwest = orders[orders[\"city\"].isin([\"Mumbai\", \"Pune\"])]\nprint(\"West:\", west[\"order_id\"].tolist())\nprint(\"Not west:\", orders.loc[~orders[\"city\"].isin([\"Mumbai\", \"Pune\"]), \"city\"].unique())\n\nmid = orders[orders[\"amount\"].between(3000, 20000)]\nprint(mid[[\"customer\", \"amount\"]])\n\nprint(orders[orders[\"customer\"].str.contains(\"ra\", case=False)][\"customer\"].tolist())\nprint(orders.nlargest(3, \"amount\")[[\"customer\", \"amount\"]])\n"
        }
      },
      "result": "West: [1001, 1002, 1004, 1006, 1008]\nNot west: ['Delhi' 'Chennai']\n  customer  amount\n2     John   18500\n3    Priya    7600\n6    Karan    5400\n7    Divya    3900\n['Sara', 'Rahul', 'Karan']\n  customer  amount\n0     Amit   45000\n5    Sneha   32000\n2     John   18500",
      "explanation": "isin is the SQL IN operator; with ~ it becomes NOT IN. between(3000, 20000) is inclusive on both ends. str.contains with case=False matches 'Rahul', 'Karan' and so on regardless of capitals. nlargest returns the top-N rows sorted - faster than sort_values().head() on large data."
    },
    {
      "title": "query() with Variables",
      "scenario": "Write the same filters in a more readable SQL-like style, using a Python variable for the threshold.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import pandas as pd\n\norders = pd.DataFrame({\n    \"order_id\": [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008],\n    \"customer\": [\"Amit\", \"Sara\", \"John\", \"Priya\", \"Rahul\", \"Sneha\", \"Karan\", \"Divya\"],\n    \"city\": [\"Mumbai\", \"Pune\", \"Delhi\", \"Mumbai\", \"Chennai\", \"Pune\", \"Delhi\", \"Mumbai\"],\n    \"category\": [\"Electronics\", \"Fashion\", \"Electronics\", \"Home\", \"Fashion\",\n                 \"Electronics\", \"Home\", \"Fashion\"],\n    \"amount\": [45000, 2300, 18500, 7600, 1200, 32000, 5400, 3900],\n    \"status\": [\"Delivered\", \"Returned\", \"Delivered\", \"Delivered\", \"Cancelled\",\n               \"Delivered\", \"Delivered\", \"Returned\"],\n})\n\nmin_amount = 5000\ncities = [\"Delhi\", \"Mumbai\"]\n\nresult = orders.query(\"amount >= @min_amount and status == 'Delivered'\")\nprint(result[[\"order_id\", \"city\", \"amount\"]])\n\nprint(orders.query(\"city in @cities and category != 'Home'\")[\"customer\"].tolist())\nprint(orders.query(\"not (status == 'Delivered')\")[\"status\"].value_counts())\n",
      "python": {
        "files": {
          "main.py": "import pandas as pd\n\norders = pd.DataFrame({\n    \"order_id\": [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008],\n    \"customer\": [\"Amit\", \"Sara\", \"John\", \"Priya\", \"Rahul\", \"Sneha\", \"Karan\", \"Divya\"],\n    \"city\": [\"Mumbai\", \"Pune\", \"Delhi\", \"Mumbai\", \"Chennai\", \"Pune\", \"Delhi\", \"Mumbai\"],\n    \"category\": [\"Electronics\", \"Fashion\", \"Electronics\", \"Home\", \"Fashion\",\n                 \"Electronics\", \"Home\", \"Fashion\"],\n    \"amount\": [45000, 2300, 18500, 7600, 1200, 32000, 5400, 3900],\n    \"status\": [\"Delivered\", \"Returned\", \"Delivered\", \"Delivered\", \"Cancelled\",\n               \"Delivered\", \"Delivered\", \"Returned\"],\n})\n\nmin_amount = 5000\ncities = [\"Delhi\", \"Mumbai\"]\n\nresult = orders.query(\"amount >= @min_amount and status == 'Delivered'\")\nprint(result[[\"order_id\", \"city\", \"amount\"]])\n\nprint(orders.query(\"city in @cities and category != 'Home'\")[\"customer\"].tolist())\nprint(orders.query(\"not (status == 'Delivered')\")[\"status\"].value_counts())\n"
        }
      },
      "result": "   order_id    city  amount\n0      1001  Mumbai   45000\n2      1003   Delhi   18500\n3      1004  Mumbai    7600\n5      1006    Pune   32000\n6      1007   Delhi    5400\n['Amit', 'John', 'Divya']\nstatus\nReturned     2\nCancelled    1\nName: count, dtype: int64",
      "explanation": "Inside query, columns are referenced by name and Python variables with @. 'and', 'or', 'not' and 'in' are allowed. The result is identical to boolean indexing but often easier to read, especially with many conditions."
    },
    {
      "title": "Updating Values Safely with loc",
      "scenario": "Returned and cancelled orders should count as zero revenue, and Pune orders get a 10% discount in a separate what-if table without touching the original.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import pandas as pd\n\norders = pd.DataFrame({\n    \"order_id\": [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008],\n    \"customer\": [\"Amit\", \"Sara\", \"John\", \"Priya\", \"Rahul\", \"Sneha\", \"Karan\", \"Divya\"],\n    \"city\": [\"Mumbai\", \"Pune\", \"Delhi\", \"Mumbai\", \"Chennai\", \"Pune\", \"Delhi\", \"Mumbai\"],\n    \"category\": [\"Electronics\", \"Fashion\", \"Electronics\", \"Home\", \"Fashion\",\n                 \"Electronics\", \"Home\", \"Fashion\"],\n    \"amount\": [45000, 2300, 18500, 7600, 1200, 32000, 5400, 3900],\n    \"status\": [\"Delivered\", \"Returned\", \"Delivered\", \"Delivered\", \"Cancelled\",\n               \"Delivered\", \"Delivered\", \"Returned\"],\n})\n\nclean = orders.copy()\nclean.loc[clean[\"status\"].isin([\"Returned\", \"Cancelled\"]), \"amount\"] = 0\nprint(clean[[\"customer\", \"status\", \"amount\"]])\nprint(\"Net revenue:\", clean[\"amount\"].sum())\n\npune = orders[orders[\"city\"] == \"Pune\"].copy()\npune[\"discounted\"] = pune[\"amount\"] * 0.9\nprint(pune[[\"customer\", \"amount\", \"discounted\"]])\nprint(\"Original Sara amount:\", orders.loc[orders[\"customer\"] == \"Sara\", \"amount\"].item())\n",
      "python": {
        "files": {
          "main.py": "import pandas as pd\n\norders = pd.DataFrame({\n    \"order_id\": [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008],\n    \"customer\": [\"Amit\", \"Sara\", \"John\", \"Priya\", \"Rahul\", \"Sneha\", \"Karan\", \"Divya\"],\n    \"city\": [\"Mumbai\", \"Pune\", \"Delhi\", \"Mumbai\", \"Chennai\", \"Pune\", \"Delhi\", \"Mumbai\"],\n    \"category\": [\"Electronics\", \"Fashion\", \"Electronics\", \"Home\", \"Fashion\",\n                 \"Electronics\", \"Home\", \"Fashion\"],\n    \"amount\": [45000, 2300, 18500, 7600, 1200, 32000, 5400, 3900],\n    \"status\": [\"Delivered\", \"Returned\", \"Delivered\", \"Delivered\", \"Cancelled\",\n               \"Delivered\", \"Delivered\", \"Returned\"],\n})\n\nclean = orders.copy()\nclean.loc[clean[\"status\"].isin([\"Returned\", \"Cancelled\"]), \"amount\"] = 0\nprint(clean[[\"customer\", \"status\", \"amount\"]])\nprint(\"Net revenue:\", clean[\"amount\"].sum())\n\npune = orders[orders[\"city\"] == \"Pune\"].copy()\npune[\"discounted\"] = pune[\"amount\"] * 0.9\nprint(pune[[\"customer\", \"amount\", \"discounted\"]])\nprint(\"Original Sara amount:\", orders.loc[orders[\"customer\"] == \"Sara\", \"amount\"].item())\n"
        }
      },
      "result": "  customer     status  amount\n0     Amit  Delivered   45000\n1     Sara   Returned       0\n2     John  Delivered   18500\n3    Priya  Delivered    7600\n4    Rahul  Cancelled       0\n5    Sneha  Delivered   32000\n6    Karan  Delivered    5400\n7    Divya   Returned       0\nNet revenue: 108500\n  customer  amount  discounted\n1     Sara    2300      2070.0\n5    Sneha   32000     28800.0\nOriginal Sara amount: 2300",
      "explanation": "clean.loc[mask, 'amount'] = 0 updates exactly the matching rows of the real DataFrame in one step. For the what-if subset we call .copy() so adding a column does not trigger SettingWithCopyWarning and the original stays unchanged. .item() extracts the single value from a one-element Series."
    }
  ],
  "interview": [
    {
      "q": "What is the difference between loc and iloc?",
      "a": "loc selects by labels (index labels and column names) and its slices include the end label. iloc selects by integer positions and its slices exclude the end position, like Python lists. loc also accepts boolean masks; iloc accepts boolean arrays but not Series.",
      "level": "Easy"
    },
    {
      "q": "What is the difference between at/iat and loc/iloc?",
      "a": "at (label) and iat (position) access a single scalar value and are faster. loc/iloc can return rows, columns or sub-tables.",
      "level": "Easy"
    },
    {
      "q": "How do you filter rows with multiple conditions in pandas?",
      "a": "Use & (and), | (or), ~ (not) with each condition in parentheses: df[(df.a > 5) & (df.b == 'X')]. Or use df.query('a > 5 and b == \"X\"').",
      "level": "Easy"
    },
    {
      "q": "Why do we get 'The truth value of a Series is ambiguous'?",
      "a": "Because Python's and/or/not or an if statement was used on a whole Series. Python needs a single True/False, but a Series contains many. Use &, |, ~ for element-wise logic, or .any()/.all() to reduce to one value.",
      "level": "Medium"
    },
    {
      "q": "How do you implement SQL IN and NOT IN in pandas?",
      "a": "df[df['city'].isin(['Pune', 'Delhi'])] for IN and df[~df['city'].isin([...])] for NOT IN.",
      "level": "Easy"
    },
    {
      "q": "What is SettingWithCopyWarning and how do you fix it?",
      "a": "It warns that you may be assigning to a copy of a slice (chained indexing like df[mask]['col'] = x), so the original may not change. Fix: use df.loc[mask, 'col'] = x for the original, or make an explicit .copy() when you want an independent subset.",
      "level": "Medium"
    },
    {
      "q": "How do you select the top 5 highest-paid employees per department?",
      "a": "df.sort_values('salary', ascending=False).groupby('dept').head(5), or df.groupby('dept', group_keys=False).apply(lambda g: g.nlargest(5, 'salary')). For an overall top 5 use df.nlargest(5, 'salary').",
      "level": "Hard"
    },
    {
      "q": "How do you reference a Python variable inside query()?",
      "a": "Prefix it with @: limit = 1000; df.query('amount > @limit'). Lists work too: df.query('city in @cities').",
      "level": "Medium"
    },
    {
      "q": "How do you filter rows where a text column contains a word, ignoring case and missing values?",
      "a": "df[df['name'].str.contains('kumar', case=False, na=False)]. na=False treats missing values as no match instead of returning NaN which would break the mask.",
      "level": "Medium"
    },
    {
      "q": "Select every second row and the last two columns of a DataFrame.",
      "a": "df.iloc[::2, -2:] - iloc accepts step slices and negative positions.",
      "level": "Medium"
    },
    {
      "q": "What does between() do and is it inclusive?",
      "a": "s.between(left, right) returns True where left <= value <= right. By default it is inclusive on both sides; change it with inclusive='left', 'right' or 'neither'.",
      "level": "Easy"
    },
    {
      "q": "Why might df.loc[0] fail after filtering or sorting a DataFrame?",
      "a": "loc uses labels. If the row labelled 0 was filtered out, it no longer exists (KeyError); after sorting, label 0 may not be the first row. Use iloc[0] for the first position or reset_index(drop=True) to renumber.",
      "level": "Hard"
    }
  ],
  "practice": [
    {
      "task": "Using an employee DataFrame (name, dept, salary, city), select only name and salary for employees in IT earning more than 60,000.",
      "hint": "df.loc[(cond1) & (cond2), ['name', 'salary']]",
      "solution": "import pandas as pd\n\ndf = pd.DataFrame({\n    \"name\": [\"Asha\", \"Vikram\", \"Neha\", \"Arjun\", \"Ravi\"],\n    \"dept\": [\"IT\", \"HR\", \"IT\", \"Sales\", \"IT\"],\n    \"salary\": [65000, 42000, 72000, 48000, 58000],\n    \"city\": [\"Pune\", \"Mumbai\", \"Pune\", \"Delhi\", \"Mumbai\"],\n})\nprint(df.loc[(df[\"dept\"] == \"IT\") & (df[\"salary\"] > 60000), [\"name\", \"salary\"]])\n"
    },
    {
      "task": "From the same data, print rows at positions 1 to 3 (iloc) and rows with labels 1 to 3 (loc). Explain the difference in the number of rows.",
      "hint": "iloc[1:3] excludes 3; loc[1:3] includes 3.",
      "solution": "import pandas as pd\n\ndf = pd.DataFrame({\"name\": [\"Asha\", \"Vikram\", \"Neha\", \"Arjun\", \"Ravi\"]})\nprint(df.iloc[1:3])   # 2 rows (positions 1, 2)\nprint(df.loc[1:3])    # 3 rows (labels 1, 2, 3)\n"
    },
    {
      "task": "Students DataFrame with name, course, marks. Use query to get students of 'Python' or 'SQL' with marks between 60 and 85, using variables for the course list and the limits.",
      "hint": "query('course in @courses and @lo <= marks <= @hi')",
      "solution": "import pandas as pd\n\ndf = pd.DataFrame({\n    \"name\": [\"Aarav\", \"Diya\", \"Kabir\", \"Meera\", \"Rohan\", \"Isha\"],\n    \"course\": [\"Python\", \"SQL\", \"Excel\", \"Python\", \"SQL\", \"Python\"],\n    \"marks\": [88, 72, 65, 61, 90, 79],\n})\ncourses, lo, hi = [\"Python\", \"SQL\"], 60, 85\nprint(df.query(\"course in @courses and @lo <= marks <= @hi\"))\n"
    },
    {
      "task": "In a product table, set the price of all 'Clearance' items to 50% of their value using loc, and print the 2 cheapest products afterwards.",
      "hint": "df.loc[mask, 'price'] = df.loc[mask, 'price'] * 0.5; nsmallest(2, 'price')",
      "solution": "import pandas as pd\n\ndf = pd.DataFrame({\n    \"product\": [\"Lamp\", \"Chair\", \"Rug\", \"Mirror\"],\n    \"tag\": [\"Clearance\", \"New\", \"Clearance\", \"New\"],\n    \"price\": [1200.0, 3500.0, 2200.0, 1800.0],\n})\nmask = df[\"tag\"] == \"Clearance\"\ndf.loc[mask, \"price\"] = df.loc[mask, \"price\"] * 0.5\nprint(df)\nprint(df.nsmallest(2, \"price\"))\n"
    },
    {
      "task": "Filter customers whose email ends with '@gmail.com' and whose name starts with 'A' or 'S'.",
      "hint": "str.endswith and str.startswith(('A', 'S')) - startswith accepts a tuple.",
      "solution": "import pandas as pd\n\ndf = pd.DataFrame({\n    \"name\": [\"Amit\", \"Sara\", \"John\", \"Anu\"],\n    \"email\": [\"amit@gmail.com\", \"sara@yahoo.com\", \"john@gmail.com\", \"anu@gmail.com\"],\n})\nmask = df[\"email\"].str.endswith(\"@gmail.com\") & df[\"name\"].str.startswith((\"A\", \"S\"))\nprint(df[mask])\n"
    }
  ],
  "quiz": [
    {
      "question": "df.loc[1:3] on a default RangeIndex returns how many rows?",
      "options": [
        "2",
        "3",
        "4",
        "1"
      ],
      "answer": 1,
      "explanation": "loc label slices include the end label: 1, 2 and 3."
    },
    {
      "question": "Which selects the first 3 rows and first 2 columns by position?",
      "options": [
        "df.loc[:3, :2]",
        "df.iloc[:3, :2]",
        "df[:3, :2]",
        "df.at[:3, :2]"
      ],
      "answer": 1,
      "explanation": "iloc uses integer positions with exclusive slicing."
    },
    {
      "question": "Which is the correct way to filter with two conditions?",
      "options": [
        "df[df.a > 1 and df.b < 5]",
        "df[(df.a > 1) & (df.b < 5)]",
        "df[df.a > 1 & df.b < 5]",
        "df.where(a > 1, b < 5)"
      ],
      "answer": 1,
      "explanation": "Use & with parentheses around each condition."
    },
    {
      "question": "How do you use a Python variable x inside df.query()?",
      "options": [
        "$x",
        "{x}",
        "@x",
        "#x"
      ],
      "answer": 2,
      "explanation": "The @ prefix refers to variables in the local scope."
    },
    {
      "question": "What is the recommended way to set values for filtered rows?",
      "options": [
        "df[mask]['col'] = v",
        "df.loc[mask, 'col'] = v",
        "df.iloc[mask]['col'] = v",
        "df.col[mask] == v"
      ],
      "answer": 1,
      "explanation": "A single loc call modifies the original DataFrame and avoids chained assignment."
    },
    {
      "question": "s.between(10, 20) for value 20 returns:",
      "options": [
        "True",
        "False",
        "NaN",
        "Error"
      ],
      "answer": 0,
      "explanation": "between is inclusive on both ends by default."
    }
  ]
};
