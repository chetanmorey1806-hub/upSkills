export default {
  "id": "day-09-merge-join-concat",
  "title": "Combining Data: merge, join and concat",
  "module": "Module 2: Pandas",
  "day": 9,
  "level": "Intermediate",
  "duration": "3 hours",
  "summary": "Combine multiple tables the way you would with SQL JOINs or Excel VLOOKUP/XLOOKUP. Use merge with inner, left, right, outer and cross joins, different key names, multiple keys, indicator and validate; join on the index; and stack tables with concat. Learn to detect row explosion from duplicate keys and to find unmatched records.",
  "objectives": [
    "Explain inner, left, right, outer and cross joins with examples",
    "Use pd.merge with on, left_on/right_on, suffixes, indicator and validate",
    "Use DataFrame.join for index-based joins",
    "Stack DataFrames vertically and horizontally with pd.concat",
    "Find unmatched rows (anti-join) and avoid duplicate-key row explosion"
  ],
  "theory": [
    {
      "heading": "Why Combine Tables?",
      "content": "Business data is stored in separate tables to avoid repetition (normalisation): customers in one table, orders in another, products in a third. To answer 'revenue by customer city' you must bring city (from customers) next to amount (from orders). In Excel you would use VLOOKUP/XLOOKUP; in SQL a JOIN; in pandas `merge`.",
      "points": [
        "**merge** - join columns from two tables on key columns (SQL JOIN)",
        "**join** - convenience method to join on the index",
        "**concat** - stack tables on top of each other (SQL UNION ALL) or side by side"
      ]
    },
    {
      "heading": "Join Types",
      "content": "The `how` parameter decides which rows are kept when keys do not match on both sides.",
      "points": [
        "`how='inner'` (default) - only keys present in BOTH tables",
        "`how='left'` - all rows of the left table; missing matches become NaN (most common in analysis, like VLOOKUP)",
        "`how='right'` - all rows of the right table",
        "`how='outer'` - all keys from both tables (full outer join)",
        "`how='cross'` - every row of left with every row of right (Cartesian product), e.g. all store x product combinations"
      ],
      "syntax": "pd.merge(orders, customers, on='cust_id', how='left')\norders.merge(customers, on='cust_id', how='inner')   # method form"
    },
    {
      "heading": "Keys with Different Names, Multiple Keys and Suffixes",
      "content": "If the key column has different names, use `left_on` and `right_on`. For composite keys pass a list. When both tables have other columns with the same name, pandas adds suffixes `_x` and `_y`; set your own with `suffixes`.",
      "syntax": "pd.merge(orders, products, left_on='prod_code', right_on='product_id')\npd.merge(sales, targets, on=['region', 'month'])\npd.merge(jan, feb, on='emp_id', suffixes=('_jan', '_feb'))",
      "tip": "Key columns must have the same dtype. Merging an int column with a string column ('101' vs 101) gives a ValueError or zero matches - convert first."
    },
    {
      "heading": "indicator and validate: Safe Merges",
      "content": "`indicator=True` adds a `_merge` column with 'both', 'left_only' or 'right_only' - perfect for finding unmatched records (orders without a valid customer, customers who never ordered). `validate` checks the relationship and raises an error if it is violated: 'one_to_one', 'one_to_many', 'many_to_one', 'many_to_many'.\n\nIf the right table has duplicate keys, each left row matches several right rows and the result has MORE rows than the left table (row explosion). Always compare row counts before and after a merge.",
      "syntax": "m = orders.merge(customers, on='cust_id', how='outer', indicator=True)\nm['_merge'].value_counts()\norders.merge(customers, on='cust_id', how='left', validate='many_to_one')"
    },
    {
      "heading": "join(): Index-Based Joining",
      "content": "`df.join(other)` joins on the index of `other` (and the index of df, or a column given with `on=`). Its default is a LEFT join. It is handy when lookup tables are indexed by their key, for example a prices table indexed by product code.",
      "syntax": "prices = products.set_index('product_id')\nsales.join(prices, on='product_id')        # left join on column vs index\nleft.join(right, how='inner', lsuffix='_l', rsuffix='_r')"
    },
    {
      "heading": "concat: Stacking Tables",
      "content": "`pd.concat([df1, df2, ...])` stacks DataFrames vertically (axis=0) - for example monthly files with the same columns into one yearly table. Columns are aligned by name; missing columns become NaN. Use `ignore_index=True` to renumber rows and `keys=` to label the source. `axis=1` places tables side by side, aligned on the index.",
      "syntax": "year = pd.concat([jan, feb, mar], ignore_index=True)\npd.concat([jan, feb], keys=['Jan', 'Feb'])\npd.concat([df_a, df_b], axis=1)\n\n# Combine many CSV files\nimport glob\nall_df = pd.concat((pd.read_csv(f) for f in glob.glob('sales_*.csv')), ignore_index=True)",
      "tip": "DataFrame.append was removed in pandas 2.0 - use pd.concat instead. Collect DataFrames in a list and concat once (calling concat inside a loop is slow)."
    }
  ],
  "examples": [
    {
      "title": "Inner vs Left vs Right vs Outer Join",
      "scenario": "Orders reference customers by cust_id. Order 104 has a customer id (5) that does not exist, and Priya (4) has no orders. See how each join type handles them.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import pandas as pd\n\ncustomers = pd.DataFrame({\n    \"cust_id\": [1, 2, 3, 4],\n    \"name\": [\"Amit\", \"Sara\", \"John\", \"Priya\"],\n    \"city\": [\"Mumbai\", \"Pune\", \"Delhi\", \"Mumbai\"],\n})\norders = pd.DataFrame({\n    \"order_id\": [101, 102, 103, 104, 105],\n    \"cust_id\": [1, 2, 1, 5, 3],\n    \"amount\": [2500, 1800, 3200, 900, 4100],\n})\n\nfor how in [\"inner\", \"left\", \"right\", \"outer\"]:\n    m = pd.merge(orders, customers, on=\"cust_id\", how=how)\n    print(f\"--- {how}: {len(m)} rows\")\n    print(m)\n",
      "python": {
        "files": {
          "main.py": "import pandas as pd\n\ncustomers = pd.DataFrame({\n    \"cust_id\": [1, 2, 3, 4],\n    \"name\": [\"Amit\", \"Sara\", \"John\", \"Priya\"],\n    \"city\": [\"Mumbai\", \"Pune\", \"Delhi\", \"Mumbai\"],\n})\norders = pd.DataFrame({\n    \"order_id\": [101, 102, 103, 104, 105],\n    \"cust_id\": [1, 2, 1, 5, 3],\n    \"amount\": [2500, 1800, 3200, 900, 4100],\n})\n\nfor how in [\"inner\", \"left\", \"right\", \"outer\"]:\n    m = pd.merge(orders, customers, on=\"cust_id\", how=how)\n    print(f\"--- {how}: {len(m)} rows\")\n    print(m)\n"
        }
      },
      "result": "--- inner: 4 rows\n   order_id  cust_id  amount  name    city\n0       101        1    2500  Amit  Mumbai\n1       102        2    1800  Sara    Pune\n2       103        1    3200  Amit  Mumbai\n3       105        3    4100  John   Delhi\n--- left: 5 rows\n   order_id  cust_id  amount  name    city\n0       101        1    2500  Amit  Mumbai\n1       102        2    1800  Sara    Pune\n2       103        1    3200  Amit  Mumbai\n3       104        5     900   NaN     NaN\n4       105        3    4100  John   Delhi\n--- right: 5 rows\n   order_id  cust_id  amount   name    city\n0     101.0        1  2500.0   Amit  Mumbai\n1     103.0        1  3200.0   Amit  Mumbai\n2     102.0        2  1800.0   Sara    Pune\n3     105.0        3  4100.0   John   Delhi\n4       NaN        4     NaN  Priya  Mumbai\n--- outer: 6 rows\n   order_id  cust_id  amount   name    city\n0     101.0        1  2500.0   Amit  Mumbai\n1     103.0        1  3200.0   Amit  Mumbai\n2     102.0        2  1800.0   Sara    Pune\n3     105.0        3  4100.0   John   Delhi\n4       NaN        4     NaN  Priya  Mumbai\n5     104.0        5   900.0    NaN     NaN",
      "explanation": "inner keeps only matching ids (4 rows - order 104 and Priya disappear). left keeps every order; order 104 gets NaN for name and city. right keeps every customer; Priya appears with NaN order details. outer keeps everything from both sides (6 rows). Notice that NaN forces integer columns like order_id to float."
    },
    {
      "title": "Finding Unmatched Records with indicator (Anti-Join)",
      "scenario": "Data quality check: which orders have an invalid customer, and which customers have never ordered?",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import pandas as pd\n\ncustomers = pd.DataFrame({\n    \"cust_id\": [1, 2, 3, 4],\n    \"name\": [\"Amit\", \"Sara\", \"John\", \"Priya\"],\n    \"city\": [\"Mumbai\", \"Pune\", \"Delhi\", \"Mumbai\"],\n})\norders = pd.DataFrame({\n    \"order_id\": [101, 102, 103, 104, 105],\n    \"cust_id\": [1, 2, 1, 5, 3],\n    \"amount\": [2500, 1800, 3200, 900, 4100],\n})\n\nm = orders.merge(customers, on=\"cust_id\", how=\"outer\", indicator=True)\nprint(m[\"_merge\"].value_counts())\n\ninvalid_orders = m.loc[m[\"_merge\"] == \"left_only\", [\"order_id\", \"cust_id\", \"amount\"]]\nprint(\"Orders with unknown customer:\")\nprint(invalid_orders)\n\nno_orders = m.loc[m[\"_merge\"] == \"right_only\", \"name\"].tolist()\nprint(\"Customers with no orders:\", no_orders)\n\nprint(\"Never ordered (isin way):\", customers.loc[~customers[\"cust_id\"].isin(orders[\"cust_id\"]), \"name\"].tolist())\n",
      "python": {
        "files": {
          "main.py": "import pandas as pd\n\ncustomers = pd.DataFrame({\n    \"cust_id\": [1, 2, 3, 4],\n    \"name\": [\"Amit\", \"Sara\", \"John\", \"Priya\"],\n    \"city\": [\"Mumbai\", \"Pune\", \"Delhi\", \"Mumbai\"],\n})\norders = pd.DataFrame({\n    \"order_id\": [101, 102, 103, 104, 105],\n    \"cust_id\": [1, 2, 1, 5, 3],\n    \"amount\": [2500, 1800, 3200, 900, 4100],\n})\n\nm = orders.merge(customers, on=\"cust_id\", how=\"outer\", indicator=True)\nprint(m[\"_merge\"].value_counts())\n\ninvalid_orders = m.loc[m[\"_merge\"] == \"left_only\", [\"order_id\", \"cust_id\", \"amount\"]]\nprint(\"Orders with unknown customer:\")\nprint(invalid_orders)\n\nno_orders = m.loc[m[\"_merge\"] == \"right_only\", \"name\"].tolist()\nprint(\"Customers with no orders:\", no_orders)\n\nprint(\"Never ordered (isin way):\", customers.loc[~customers[\"cust_id\"].isin(orders[\"cust_id\"]), \"name\"].tolist())\n"
        }
      },
      "result": "_merge\nboth          4\nleft_only     1\nright_only    1\nName: count, dtype: int64\nOrders with unknown customer:\n   order_id  cust_id  amount\n5     104.0        5   900.0\nCustomers with no orders: ['Priya']\nNever ordered (isin way): ['Priya']",
      "explanation": "indicator=True adds a _merge column. left_only rows exist only in orders (invalid customer reference), right_only rows exist only in customers (never ordered). This is called an anti-join. The isin approach gives the same answer for a single key and is often faster."
    },
    {
      "title": "Different Key Names, Suffixes and validate",
      "scenario": "The sales table calls the product key 'sku' while the product master calls it 'product_code'. Both tables have a 'price' column. Also check for duplicate keys in the product master.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import pandas as pd\n\nsales = pd.DataFrame({\"sku\": [\"P1\", \"P2\", \"P1\", \"P3\"], \"qty\": [2, 1, 5, 3],\n                      \"price\": [480, 1150, 480, 280]})\nproducts = pd.DataFrame({\"product_code\": [\"P1\", \"P2\", \"P3\"],\n                         \"product\": [\"Mouse\", \"Keyboard\", \"Cable\"],\n                         \"price\": [499, 1199, 299]})\n\nm = sales.merge(products, left_on=\"sku\", right_on=\"product_code\",\n                how=\"left\", suffixes=(\"_sold\", \"_list\"), validate=\"many_to_one\")\nm[\"discount\"] = m[\"price_list\"] - m[\"price_sold\"]\nprint(m[[\"sku\", \"product\", \"qty\", \"price_sold\", \"price_list\", \"discount\"]])\n\ndup_products = pd.concat([products, products.iloc[[0]]])\nprint(\"Rows before:\", len(sales), \"after bad merge:\",\n      len(sales.merge(dup_products, left_on=\"sku\", right_on=\"product_code\")))\ntry:\n    sales.merge(dup_products, left_on=\"sku\", right_on=\"product_code\", validate=\"many_to_one\")\nexcept pd.errors.MergeError as e:\n    print(\"MergeError:\", e)\n",
      "python": {
        "files": {
          "main.py": "import pandas as pd\n\nsales = pd.DataFrame({\"sku\": [\"P1\", \"P2\", \"P1\", \"P3\"], \"qty\": [2, 1, 5, 3],\n                      \"price\": [480, 1150, 480, 280]})\nproducts = pd.DataFrame({\"product_code\": [\"P1\", \"P2\", \"P3\"],\n                         \"product\": [\"Mouse\", \"Keyboard\", \"Cable\"],\n                         \"price\": [499, 1199, 299]})\n\nm = sales.merge(products, left_on=\"sku\", right_on=\"product_code\",\n                how=\"left\", suffixes=(\"_sold\", \"_list\"), validate=\"many_to_one\")\nm[\"discount\"] = m[\"price_list\"] - m[\"price_sold\"]\nprint(m[[\"sku\", \"product\", \"qty\", \"price_sold\", \"price_list\", \"discount\"]])\n\ndup_products = pd.concat([products, products.iloc[[0]]])\nprint(\"Rows before:\", len(sales), \"after bad merge:\",\n      len(sales.merge(dup_products, left_on=\"sku\", right_on=\"product_code\")))\ntry:\n    sales.merge(dup_products, left_on=\"sku\", right_on=\"product_code\", validate=\"many_to_one\")\nexcept pd.errors.MergeError as e:\n    print(\"MergeError:\", e)\n"
        }
      },
      "result": "  sku   product  qty  price_sold  price_list  discount\n0  P1     Mouse    2         480         499        19\n1  P2  Keyboard    1        1150        1199        49\n2  P1     Mouse    5         480         499        19\n3  P3     Cable    3         280         299        19\nRows before: 4 after bad merge: 6\nMergeError: Merge keys are not unique in right dataset; not a many-to-one merge",
      "explanation": "left_on/right_on connect differently named keys. suffixes make the two price columns readable (_sold vs _list). validate='many_to_one' confirms each sku matches at most one product. When the product master accidentally contains P1 twice, every P1 sale is duplicated (4 rows become 6) and revenue would be overstated - validate catches this with a MergeError."
    },
    {
      "title": "Stacking Monthly Files with concat",
      "scenario": "Three monthly sales extracts must be combined into one quarterly table. March has an extra 'channel' column.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import pandas as pd\n\njan = pd.DataFrame({\"order_id\": [1, 2], \"amount\": [1200, 800]})\nfeb = pd.DataFrame({\"order_id\": [3, 4], \"amount\": [1500, 950]})\nmar = pd.DataFrame({\"order_id\": [5], \"amount\": [2100], \"channel\": [\"App\"]})\n\nq1 = pd.concat([jan, feb, mar], ignore_index=True)\nprint(q1)\n\nlabelled = pd.concat([jan, feb, mar], keys=[\"Jan\", \"Feb\", \"Mar\"], names=[\"month\", \"row\"])\nprint(labelled.groupby(level=\"month\", sort=False)[\"amount\"].sum())\n\ntotals = pd.concat([jan[\"amount\"].rename(\"jan\"), feb[\"amount\"].rename(\"feb\")], axis=1)\nprint(totals)\n",
      "python": {
        "files": {
          "main.py": "import pandas as pd\n\njan = pd.DataFrame({\"order_id\": [1, 2], \"amount\": [1200, 800]})\nfeb = pd.DataFrame({\"order_id\": [3, 4], \"amount\": [1500, 950]})\nmar = pd.DataFrame({\"order_id\": [5], \"amount\": [2100], \"channel\": [\"App\"]})\n\nq1 = pd.concat([jan, feb, mar], ignore_index=True)\nprint(q1)\n\nlabelled = pd.concat([jan, feb, mar], keys=[\"Jan\", \"Feb\", \"Mar\"], names=[\"month\", \"row\"])\nprint(labelled.groupby(level=\"month\", sort=False)[\"amount\"].sum())\n\ntotals = pd.concat([jan[\"amount\"].rename(\"jan\"), feb[\"amount\"].rename(\"feb\")], axis=1)\nprint(totals)\n"
        }
      },
      "result": "   order_id  amount channel\n0         1    1200     NaN\n1         2     800     NaN\n2         3    1500     NaN\n3         4     950     NaN\n4         5    2100     App\nmonth\nJan    2000\nFeb    2450\nMar    2100\nName: amount, dtype: int64\n    jan   feb\n0  1200  1500\n1   800   950",
      "explanation": "concat aligns columns by name: jan and feb have no channel, so those cells are NaN. ignore_index=True renumbers rows 0-4. keys= adds an outer index level naming the source month, so we can group by it. axis=1 places Series side by side aligned on their index."
    },
    {
      "title": "Three-Table Report: Orders + Customers + Products",
      "scenario": "Build a revenue-by-city-and-category report by merging three tables, using join for the product lookup.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import pandas as pd\n\norders = pd.DataFrame({\n    \"order_id\": [1, 2, 3, 4, 5, 6],\n    \"cust_id\": [1, 2, 1, 3, 2, 3],\n    \"product_id\": [\"P1\", \"P2\", \"P3\", \"P1\", \"P3\", \"P2\"],\n    \"qty\": [1, 2, 3, 2, 1, 1],\n})\ncustomers = pd.DataFrame({\"cust_id\": [1, 2, 3], \"city\": [\"Mumbai\", \"Pune\", \"Mumbai\"]})\nproducts = pd.DataFrame({\"product_id\": [\"P1\", \"P2\", \"P3\"],\n                         \"category\": [\"Electronics\", \"Fashion\", \"Home\"],\n                         \"price\": [15000, 1200, 800]}).set_index(\"product_id\")\n\nfull = (orders.merge(customers, on=\"cust_id\", how=\"left\", validate=\"many_to_one\")\n              .join(products, on=\"product_id\"))\nfull[\"revenue\"] = full[\"qty\"] * full[\"price\"]\nprint(full)\nprint(full.pivot_table(index=\"city\", columns=\"category\", values=\"revenue\",\n                       aggfunc=\"sum\", fill_value=0))\n",
      "python": {
        "files": {
          "main.py": "import pandas as pd\n\norders = pd.DataFrame({\n    \"order_id\": [1, 2, 3, 4, 5, 6],\n    \"cust_id\": [1, 2, 1, 3, 2, 3],\n    \"product_id\": [\"P1\", \"P2\", \"P3\", \"P1\", \"P3\", \"P2\"],\n    \"qty\": [1, 2, 3, 2, 1, 1],\n})\ncustomers = pd.DataFrame({\"cust_id\": [1, 2, 3], \"city\": [\"Mumbai\", \"Pune\", \"Mumbai\"]})\nproducts = pd.DataFrame({\"product_id\": [\"P1\", \"P2\", \"P3\"],\n                         \"category\": [\"Electronics\", \"Fashion\", \"Home\"],\n                         \"price\": [15000, 1200, 800]}).set_index(\"product_id\")\n\nfull = (orders.merge(customers, on=\"cust_id\", how=\"left\", validate=\"many_to_one\")\n              .join(products, on=\"product_id\"))\nfull[\"revenue\"] = full[\"qty\"] * full[\"price\"]\nprint(full)\nprint(full.pivot_table(index=\"city\", columns=\"category\", values=\"revenue\",\n                       aggfunc=\"sum\", fill_value=0))\n"
        }
      },
      "result": "   order_id  cust_id product_id  qty    city     category  price  revenue\n0         1        1         P1    1  Mumbai  Electronics  15000    15000\n1         2        2         P2    2    Pune      Fashion   1200     2400\n2         3        1         P3    3  Mumbai         Home    800     2400\n3         4        3         P1    2  Mumbai  Electronics  15000    30000\n4         5        2         P3    1    Pune         Home    800      800\n5         6        3         P2    1  Mumbai      Fashion   1200     1200\ncategory  Electronics  Fashion  Home\ncity                                \nMumbai          45000     1200  2400\nPune                0     2400   800",
      "explanation": "merge adds city from customers; join adds category and price by looking up product_id in the products index (a left join by default). Revenue is then computed and summarised with pivot_table. Chaining merge and join like this is a typical star-schema pattern: one fact table (orders) and several lookup (dimension) tables."
    }
  ],
  "interview": [
    {
      "q": "What is the difference between merge, join and concat?",
      "a": "merge combines DataFrames on key columns like SQL JOIN. join is a DataFrame method that joins on the index (left join by default). concat stacks DataFrames along an axis (rows or columns) without matching keys, like UNION ALL.",
      "level": "Easy"
    },
    {
      "q": "Explain inner, left, right and outer joins.",
      "a": "Inner keeps rows with keys in both tables. Left keeps all rows of the left table plus matches (NaN where no match). Right keeps all rows of the right table. Outer keeps all keys from both, with NaN where a side is missing.",
      "level": "Easy"
    },
    {
      "q": "What is the default join type of pd.merge and of DataFrame.join?",
      "a": "pd.merge defaults to how='inner'. DataFrame.join defaults to how='left'.",
      "level": "Medium"
    },
    {
      "q": "Why might a merge return more rows than the left table?",
      "a": "Because the right table has duplicate keys (one-to-many or many-to-many relationship). Each left row is repeated for every match. Check with right['key'].duplicated().sum() and use validate='many_to_one' to catch it.",
      "level": "Medium"
    },
    {
      "q": "How do you find customers who never placed an order?",
      "a": "Anti-join: m = customers.merge(orders, on='cust_id', how='left', indicator=True); m[m['_merge'] == 'left_only']. Or customers[~customers['cust_id'].isin(orders['cust_id'])].",
      "level": "Medium"
    },
    {
      "q": "How do you merge on columns with different names?",
      "a": "pd.merge(a, b, left_on='emp_id', right_on='employee_id'). Both key columns appear in the result; drop one afterwards if needed.",
      "level": "Easy"
    },
    {
      "q": "What do suffixes do in merge?",
      "a": "When both tables have non-key columns with the same name, pandas renames them with suffixes (default _x and _y). suffixes=('_2023', '_2024') makes the output clearer.",
      "level": "Easy"
    },
    {
      "q": "What is the replacement for DataFrame.append?",
      "a": "append was deprecated in 1.4 and removed in pandas 2.0. Use pd.concat([df, new_rows], ignore_index=True). For many pieces, collect them in a list and call concat once.",
      "level": "Medium"
    },
    {
      "q": "What is a cross join and when would you use it?",
      "a": "how='cross' returns the Cartesian product: every left row with every right row. Use it to create all combinations, e.g. every store x every product to find which combinations had zero sales after a left merge with actual sales.",
      "level": "Hard"
    },
    {
      "q": "Merge returned zero matching rows though the IDs look the same. What would you check?",
      "a": "Data types (int vs string), leading/trailing spaces, case differences, leading zeros ('007' vs 7), and hidden characters. Fix with astype, str.strip(), str.upper(), str.zfill() before merging.",
      "level": "Hard"
    },
    {
      "q": "How is pandas merge similar to Excel VLOOKUP?",
      "a": "A left merge with a lookup table is like VLOOKUP/XLOOKUP for every row at once: the key is the lookup value and the right table is the lookup range. Unlike VLOOKUP it can return many columns, handle multiple keys and report unmatched rows with indicator.",
      "level": "Easy"
    }
  ],
  "practice": [
    {
      "task": "Employees (emp_id, name, dept_id) and departments (dept_id, dept_name). One employee has dept_id 99 which does not exist. Do a left merge and list employees without a valid department.",
      "hint": "merge(how='left'), then filter dept_name.isna()",
      "solution": "import pandas as pd\n\nemp = pd.DataFrame({\"emp_id\": [1, 2, 3, 4], \"name\": [\"Asha\", \"Vikram\", \"Neha\", \"Ravi\"],\n                    \"dept_id\": [10, 20, 10, 99]})\ndept = pd.DataFrame({\"dept_id\": [10, 20, 30], \"dept_name\": [\"IT\", \"HR\", \"Sales\"]})\nm = emp.merge(dept, on=\"dept_id\", how=\"left\")\nprint(m)\nprint(m.loc[m[\"dept_name\"].isna(), \"name\"].tolist())\n"
    },
    {
      "task": "Compare employee salaries in 2023 and 2024 tables (emp_id, salary) and compute the increment % for employees present in both years.",
      "hint": "inner merge with suffixes=('_2023', '_2024')",
      "solution": "import pandas as pd\n\ns23 = pd.DataFrame({\"emp_id\": [1, 2, 3], \"salary\": [50000, 60000, 45000]})\ns24 = pd.DataFrame({\"emp_id\": [1, 2, 4], \"salary\": [55000, 63000, 40000]})\nm = s23.merge(s24, on=\"emp_id\", suffixes=(\"_2023\", \"_2024\"))\nm[\"increment_pct\"] = ((m[\"salary_2024\"] / m[\"salary_2023\"] - 1) * 100).round(1)\nprint(m)\n"
    },
    {
      "task": "Stack three branch DataFrames (Pune, Mumbai, Delhi) with the same columns into one table with a 'branch' column, then total revenue per branch.",
      "hint": "Add the column with assign before concat, or use keys= then reset_index.",
      "solution": "import pandas as pd\n\npune = pd.DataFrame({\"revenue\": [1000, 2000]})\nmumbai = pd.DataFrame({\"revenue\": [3000]})\ndelhi = pd.DataFrame({\"revenue\": [1500, 500, 700]})\nallb = pd.concat([pune.assign(branch=\"Pune\"), mumbai.assign(branch=\"Mumbai\"),\n                  delhi.assign(branch=\"Delhi\")], ignore_index=True)\nprint(allb.groupby(\"branch\")[\"revenue\"].sum())\n"
    },
    {
      "task": "Create all store x product combinations with a cross join, merge actual sales onto it and fill missing quantities with 0 to find combinations with no sales.",
      "hint": "stores.merge(products, how='cross'), then left merge with sales on both keys.",
      "solution": "import pandas as pd\n\nstores = pd.DataFrame({\"store\": [\"S1\", \"S2\"]})\nproducts = pd.DataFrame({\"product\": [\"Pen\", \"Book\", \"Bag\"]})\nsales = pd.DataFrame({\"store\": [\"S1\", \"S1\", \"S2\"], \"product\": [\"Pen\", \"Bag\", \"Pen\"],\n                      \"qty\": [10, 2, 7]})\ngrid = stores.merge(products, how=\"cross\")\nfull = grid.merge(sales, on=[\"store\", \"product\"], how=\"left\").fillna({\"qty\": 0})\nprint(full)\nprint(full[full[\"qty\"] == 0])\n"
    }
  ],
  "quiz": [
    {
      "question": "What is the default 'how' in pd.merge?",
      "options": [
        "left",
        "right",
        "inner",
        "outer"
      ],
      "answer": 2,
      "explanation": "merge performs an inner join unless told otherwise."
    },
    {
      "question": "Which join keeps all rows from both tables?",
      "options": [
        "inner",
        "left",
        "outer",
        "cross"
      ],
      "answer": 2,
      "explanation": "An outer join keeps every key from both sides."
    },
    {
      "question": "indicator=True adds which column?",
      "options": [
        "_join",
        "_merge",
        "_source",
        "_match"
      ],
      "answer": 1,
      "explanation": "The _merge column shows both, left_only or right_only."
    },
    {
      "question": "What replaced DataFrame.append in pandas 2.x?",
      "options": [
        "df.add",
        "pd.concat",
        "df.merge",
        "df.extend"
      ],
      "answer": 1,
      "explanation": "append was removed; use pd.concat."
    },
    {
      "question": "Merging 100 orders with a product table where one product code appears twice can give:",
      "options": [
        "Fewer than 100 rows",
        "Exactly 100 rows always",
        "More than 100 rows",
        "An empty result"
      ],
      "answer": 2,
      "explanation": "Duplicate keys on the right repeat matching left rows (row explosion)."
    },
    {
      "question": "DataFrame.join joins on ___ of the other DataFrame by default.",
      "options": [
        "the first column",
        "the index",
        "all common columns",
        "the last column"
      ],
      "answer": 1,
      "explanation": "join matches on the other DataFrame's index."
    }
  ]
};
