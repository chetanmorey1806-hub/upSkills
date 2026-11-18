export default {
  "id": "day-08-groupby-aggregation-pivot-table",
  "title": "GroupBy, Aggregation, pivot_table and crosstab",
  "module": "Module 2: Pandas",
  "day": 8,
  "level": "Intermediate",
  "duration": "3.5 hours",
  "summary": "Summarise data like an Excel PivotTable or SQL GROUP BY. Learn the split-apply-combine idea, aggregate with sum/mean/count/size/nunique, use agg with named aggregations, transform to add group-level columns, filter groups, and build pivot tables and crosstabs with totals and percentages.",
  "objectives": [
    "Explain split-apply-combine and write groupby with one or more keys",
    "Use agg with multiple functions and named aggregations",
    "Distinguish count, size and nunique; handle as_index and reset_index",
    "Use transform for group-wise columns (share of total, rank in group) and filter for group conditions",
    "Build pivot_table with margins and fill_value, and crosstab with normalize",
    "Reshape between wide and long with melt, stack and unstack"
  ],
  "theory": [
    {
      "heading": "Split-Apply-Combine",
      "content": "`groupby` is the most-used pandas operation in analyst interviews. It works in three steps: **split** the rows into groups by a key (e.g. region), **apply** a function to each group (sum of revenue) and **combine** the results into a new Series/DataFrame. It is the same as SQL `SELECT region, SUM(revenue) FROM sales GROUP BY region`.",
      "syntax": "sales.groupby('region')['revenue'].sum()            # Series\nsales.groupby('region', as_index=False)['revenue'].sum()   # DataFrame\nsales.groupby(['region', 'category'])['revenue'].sum()   # MultiIndex\nsales.groupby('region')['revenue'].sum().sort_values(ascending=False)",
      "tip": "as_index=False (or .reset_index()) returns a normal table with the key as a column - easier to export to Excel or merge later."
    },
    {
      "heading": "Aggregation Functions",
      "content": "Common aggregations: `sum, mean, median, min, max, std, count, size, nunique, first, last`. Be careful with the three counting functions:",
      "points": [
        "`count()` - number of NON-NULL values per column",
        "`size()` - number of rows in each group (includes nulls)",
        "`nunique()` - number of distinct values (e.g. distinct customers per region)",
        "`value_counts()` on a grouped column gives counts per sub-category",
        "By default groupby drops rows whose key is NaN; use `dropna=False` to keep them"
      ]
    },
    {
      "heading": "agg() and Named Aggregation",
      "content": "`agg` applies several functions at once. **Named aggregation** gives clean output column names - this is the style recommended for reports.",
      "syntax": "sales.groupby('region')['revenue'].agg(['sum', 'mean', 'count'])\n\nsales.groupby('region').agg(\n    total_revenue=('revenue', 'sum'),\n    avg_revenue=('revenue', 'mean'),\n    orders=('revenue', 'size'),\n    reps=('rep', 'nunique'),\n    max_units=('units', 'max'),\n).reset_index()",
      "tip": "You can pass your own function too: agg(range=('revenue', lambda s: s.max() - s.min()))."
    },
    {
      "heading": "transform and filter",
      "content": "`agg` returns ONE row per group. `transform` returns a result with the SAME length as the original DataFrame, so you can add group-level values as a new column - for example each sale's share of its region's revenue, or the difference from the department average. `filter` keeps or removes whole groups based on a condition.",
      "syntax": "sales['region_total'] = sales.groupby('region')['revenue'].transform('sum')\nsales['share_pct'] = sales['revenue'] / sales['region_total'] * 100\nsales['rank_in_region'] = sales.groupby('region')['revenue'].rank(ascending=False)\nsales.groupby('rep').filter(lambda g: g['revenue'].sum() > 300000)"
    },
    {
      "heading": "pivot_table: Excel PivotTables in Python",
      "content": "`pd.pivot_table` reshapes and summarises in one step: `index` = rows, `columns` = column headers, `values` = what to aggregate, `aggfunc` = how. `margins=True` adds Grand Total row/column and `fill_value=0` replaces empty cells.",
      "syntax": "pd.pivot_table(sales, index='region', columns='category',\n               values='revenue', aggfunc='sum',\n               fill_value=0, margins=True, margins_name='Total')",
      "points": [
        "`df.pivot(index, columns, values)` only reshapes (no aggregation) and fails if there are duplicate index/column pairs",
        "aggfunc can be a list: `aggfunc=['sum', 'mean']`, or a dict per value column"
      ]
    },
    {
      "heading": "crosstab, melt, stack and unstack",
      "content": "`pd.crosstab(a, b)` counts how often each combination occurs - perfect for frequency tables like region x category. `normalize='index'` converts counts to row percentages.\n\nReshaping: **wide** data has one column per month; **long** data has a 'month' column and a 'value' column. `melt` turns wide into long (needed for Seaborn and databases); `pivot`/`pivot_table` turns long into wide (needed for reports). `unstack()` moves an index level to columns; `stack()` does the opposite.",
      "syntax": "pd.crosstab(sales['region'], sales['category'], margins=True)\npd.crosstab(sales['region'], sales['category'], normalize='index')\nwide.melt(id_vars='product', var_name='month', value_name='sales')\nsales.groupby(['region', 'category'])['revenue'].sum().unstack(fill_value=0)"
    }
  ],
  "examples": [
    {
      "title": "Basic groupby: Revenue by Region",
      "scenario": "Find total revenue per region, sorted from highest to lowest, and the number of orders and distinct reps per region.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import pandas as pd\n\nsales = pd.DataFrame({\n    \"region\": [\"North\", \"South\", \"North\", \"West\", \"South\", \"West\", \"North\", \"South\", \"West\", \"North\"],\n    \"category\": [\"Laptop\", \"Phone\", \"Phone\", \"Laptop\", \"Laptop\", \"Phone\", \"Laptop\", \"Phone\", \"Tablet\", \"Tablet\"],\n    \"rep\": [\"Amit\", \"Sara\", \"Amit\", \"Ravi\", \"Sara\", \"Ravi\", \"Neha\", \"Kiran\", \"Ravi\", \"Neha\"],\n    \"units\": [3, 10, 8, 2, 4, 12, 5, 6, 7, 4],\n    \"revenue\": [165000, 150000, 112000, 118000, 216000, 174000, 270000, 87000, 98000, 60000],\n})\n\nby_region = sales.groupby(\"region\")[\"revenue\"].sum().sort_values(ascending=False)\nprint(by_region)\nprint(\"Best region:\", by_region.idxmax())\n\nprint(sales.groupby(\"region\").size())\nprint(sales.groupby(\"region\")[\"rep\"].nunique())\nprint(sales.groupby([\"region\", \"category\"])[\"units\"].sum())\n",
      "python": {
        "files": {
          "main.py": "import pandas as pd\n\nsales = pd.DataFrame({\n    \"region\": [\"North\", \"South\", \"North\", \"West\", \"South\", \"West\", \"North\", \"South\", \"West\", \"North\"],\n    \"category\": [\"Laptop\", \"Phone\", \"Phone\", \"Laptop\", \"Laptop\", \"Phone\", \"Laptop\", \"Phone\", \"Tablet\", \"Tablet\"],\n    \"rep\": [\"Amit\", \"Sara\", \"Amit\", \"Ravi\", \"Sara\", \"Ravi\", \"Neha\", \"Kiran\", \"Ravi\", \"Neha\"],\n    \"units\": [3, 10, 8, 2, 4, 12, 5, 6, 7, 4],\n    \"revenue\": [165000, 150000, 112000, 118000, 216000, 174000, 270000, 87000, 98000, 60000],\n})\n\nby_region = sales.groupby(\"region\")[\"revenue\"].sum().sort_values(ascending=False)\nprint(by_region)\nprint(\"Best region:\", by_region.idxmax())\n\nprint(sales.groupby(\"region\").size())\nprint(sales.groupby(\"region\")[\"rep\"].nunique())\nprint(sales.groupby([\"region\", \"category\"])[\"units\"].sum())\n"
        }
      },
      "result": "region\nNorth    607000\nSouth    453000\nWest     390000\nName: revenue, dtype: int64\nBest region: North\nregion\nNorth    4\nSouth    3\nWest     3\ndtype: int64\nregion\nNorth    2\nSouth    2\nWest     1\nName: rep, dtype: int64\nregion  category\nNorth   Laptop       8\n        Phone        8\n        Tablet       4\nSouth   Laptop       4\n        Phone       16\nWest    Laptop       2\n        Phone       12\n        Tablet       7\nName: units, dtype: int64",
      "explanation": "groupby('region')['revenue'].sum() returns a Series indexed by region. size() counts rows per group (orders) and nunique() counts distinct reps. Grouping by two keys creates a MultiIndex Series with one row per (region, category) combination that exists in the data."
    },
    {
      "title": "Named Aggregation Report",
      "scenario": "Build a regional summary table with total revenue, average order value, number of orders, units sold and best single order - ready to export to Excel.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import pandas as pd\n\nsales = pd.DataFrame({\n    \"region\": [\"North\", \"South\", \"North\", \"West\", \"South\", \"West\", \"North\", \"South\", \"West\", \"North\"],\n    \"category\": [\"Laptop\", \"Phone\", \"Phone\", \"Laptop\", \"Laptop\", \"Phone\", \"Laptop\", \"Phone\", \"Tablet\", \"Tablet\"],\n    \"rep\": [\"Amit\", \"Sara\", \"Amit\", \"Ravi\", \"Sara\", \"Ravi\", \"Neha\", \"Kiran\", \"Ravi\", \"Neha\"],\n    \"units\": [3, 10, 8, 2, 4, 12, 5, 6, 7, 4],\n    \"revenue\": [165000, 150000, 112000, 118000, 216000, 174000, 270000, 87000, 98000, 60000],\n})\n\nreport = (sales.groupby(\"region\")\n               .agg(total_revenue=(\"revenue\", \"sum\"),\n                    avg_order=(\"revenue\", \"mean\"),\n                    orders=(\"revenue\", \"size\"),\n                    units=(\"units\", \"sum\"),\n                    best_order=(\"revenue\", \"max\"))\n               .round(0)\n               .sort_values(\"total_revenue\", ascending=False)\n               .reset_index())\nreport[\"share_pct\"] = (report[\"total_revenue\"] / report[\"total_revenue\"].sum() * 100).round(1)\nprint(report)\nprint(sales.groupby(\"category\")[\"revenue\"].agg([\"sum\", \"mean\", \"count\"]))\n",
      "python": {
        "files": {
          "main.py": "import pandas as pd\n\nsales = pd.DataFrame({\n    \"region\": [\"North\", \"South\", \"North\", \"West\", \"South\", \"West\", \"North\", \"South\", \"West\", \"North\"],\n    \"category\": [\"Laptop\", \"Phone\", \"Phone\", \"Laptop\", \"Laptop\", \"Phone\", \"Laptop\", \"Phone\", \"Tablet\", \"Tablet\"],\n    \"rep\": [\"Amit\", \"Sara\", \"Amit\", \"Ravi\", \"Sara\", \"Ravi\", \"Neha\", \"Kiran\", \"Ravi\", \"Neha\"],\n    \"units\": [3, 10, 8, 2, 4, 12, 5, 6, 7, 4],\n    \"revenue\": [165000, 150000, 112000, 118000, 216000, 174000, 270000, 87000, 98000, 60000],\n})\n\nreport = (sales.groupby(\"region\")\n               .agg(total_revenue=(\"revenue\", \"sum\"),\n                    avg_order=(\"revenue\", \"mean\"),\n                    orders=(\"revenue\", \"size\"),\n                    units=(\"units\", \"sum\"),\n                    best_order=(\"revenue\", \"max\"))\n               .round(0)\n               .sort_values(\"total_revenue\", ascending=False)\n               .reset_index())\nreport[\"share_pct\"] = (report[\"total_revenue\"] / report[\"total_revenue\"].sum() * 100).round(1)\nprint(report)\nprint(sales.groupby(\"category\")[\"revenue\"].agg([\"sum\", \"mean\", \"count\"]))\n"
        }
      },
      "result": "  region  total_revenue  avg_order  orders  units  best_order  share_pct\n0  North         607000   151750.0       4     20      270000       41.9\n1  South         453000   151000.0       3     20      216000       31.2\n2   West         390000   130000.0       3     21      174000       26.9\n             sum      mean  count\ncategory                         \nLaptop    769000  192250.0      4\nPhone     523000  130750.0      4\nTablet    158000   79000.0      2",
      "explanation": "Named aggregation uses new_name=(column, function), producing clear column names. reset_index turns region into a normal column. The share column divides each region's total by the grand total. The last line shows the list form of agg, which names columns after the functions."
    },
    {
      "title": "transform and filter: Share Within Region and Top Reps",
      "scenario": "Add each order's share of its region's revenue and its rank within the region, then keep only reps whose total revenue exceeds 3 lakh.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import pandas as pd\n\nsales = pd.DataFrame({\n    \"region\": [\"North\", \"South\", \"North\", \"West\", \"South\", \"West\", \"North\", \"South\", \"West\", \"North\"],\n    \"category\": [\"Laptop\", \"Phone\", \"Phone\", \"Laptop\", \"Laptop\", \"Phone\", \"Laptop\", \"Phone\", \"Tablet\", \"Tablet\"],\n    \"rep\": [\"Amit\", \"Sara\", \"Amit\", \"Ravi\", \"Sara\", \"Ravi\", \"Neha\", \"Kiran\", \"Ravi\", \"Neha\"],\n    \"units\": [3, 10, 8, 2, 4, 12, 5, 6, 7, 4],\n    \"revenue\": [165000, 150000, 112000, 118000, 216000, 174000, 270000, 87000, 98000, 60000],\n})\n\nsales[\"region_total\"] = sales.groupby(\"region\")[\"revenue\"].transform(\"sum\")\nsales[\"share_pct\"] = (sales[\"revenue\"] / sales[\"region_total\"] * 100).round(1)\nsales[\"rank\"] = sales.groupby(\"region\")[\"revenue\"].rank(ascending=False).astype(int)\nprint(sales[[\"region\", \"rep\", \"revenue\", \"share_pct\", \"rank\"]].sort_values([\"region\", \"rank\"]))\n\ntop_reps = sales.groupby(\"rep\").filter(lambda g: g[\"revenue\"].sum() > 300000)\nprint(top_reps[\"rep\"].unique())\n",
      "python": {
        "files": {
          "main.py": "import pandas as pd\n\nsales = pd.DataFrame({\n    \"region\": [\"North\", \"South\", \"North\", \"West\", \"South\", \"West\", \"North\", \"South\", \"West\", \"North\"],\n    \"category\": [\"Laptop\", \"Phone\", \"Phone\", \"Laptop\", \"Laptop\", \"Phone\", \"Laptop\", \"Phone\", \"Tablet\", \"Tablet\"],\n    \"rep\": [\"Amit\", \"Sara\", \"Amit\", \"Ravi\", \"Sara\", \"Ravi\", \"Neha\", \"Kiran\", \"Ravi\", \"Neha\"],\n    \"units\": [3, 10, 8, 2, 4, 12, 5, 6, 7, 4],\n    \"revenue\": [165000, 150000, 112000, 118000, 216000, 174000, 270000, 87000, 98000, 60000],\n})\n\nsales[\"region_total\"] = sales.groupby(\"region\")[\"revenue\"].transform(\"sum\")\nsales[\"share_pct\"] = (sales[\"revenue\"] / sales[\"region_total\"] * 100).round(1)\nsales[\"rank\"] = sales.groupby(\"region\")[\"revenue\"].rank(ascending=False).astype(int)\nprint(sales[[\"region\", \"rep\", \"revenue\", \"share_pct\", \"rank\"]].sort_values([\"region\", \"rank\"]))\n\ntop_reps = sales.groupby(\"rep\").filter(lambda g: g[\"revenue\"].sum() > 300000)\nprint(top_reps[\"rep\"].unique())\n"
        }
      },
      "result": "  region    rep  revenue  share_pct  rank\n6  North   Neha   270000       44.5     1\n0  North   Amit   165000       27.2     2\n2  North   Amit   112000       18.5     3\n9  North   Neha    60000        9.9     4\n4  South   Sara   216000       47.7     1\n1  South   Sara   150000       33.1     2\n7  South  Kiran    87000       19.2     3\n5   West   Ravi   174000       44.6     1\n3   West   Ravi   118000       30.3     2\n8   West   Ravi    98000       25.1     3\n['Sara' 'Ravi' 'Neha']",
      "explanation": "transform('sum') returns the region total on every row, so you can divide row by group without a merge. rank inside groupby ranks orders within each region. filter keeps all rows of the groups that pass the condition: Amit (2,77,000) fails, while Sara (3,66,000), Ravi (3,90,000) and Neha (3,30,000) pass."
    },
    {
      "title": "pivot_table with Totals and crosstab",
      "scenario": "Recreate an Excel PivotTable: regions as rows, categories as columns, sum of revenue with grand totals. Then count orders per combination and show row percentages.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import pandas as pd\n\nsales = pd.DataFrame({\n    \"region\": [\"North\", \"South\", \"North\", \"West\", \"South\", \"West\", \"North\", \"South\", \"West\", \"North\"],\n    \"category\": [\"Laptop\", \"Phone\", \"Phone\", \"Laptop\", \"Laptop\", \"Phone\", \"Laptop\", \"Phone\", \"Tablet\", \"Tablet\"],\n    \"rep\": [\"Amit\", \"Sara\", \"Amit\", \"Ravi\", \"Sara\", \"Ravi\", \"Neha\", \"Kiran\", \"Ravi\", \"Neha\"],\n    \"units\": [3, 10, 8, 2, 4, 12, 5, 6, 7, 4],\n    \"revenue\": [165000, 150000, 112000, 118000, 216000, 174000, 270000, 87000, 98000, 60000],\n})\n\npt = pd.pivot_table(sales, index=\"region\", columns=\"category\", values=\"revenue\",\n                    aggfunc=\"sum\", fill_value=0, margins=True, margins_name=\"Total\")\nprint(pt)\n\nprint(pd.crosstab(sales[\"region\"], sales[\"category\"]))\nprint((pd.crosstab(sales[\"region\"], sales[\"category\"], normalize=\"index\") * 100).round(1))\n",
      "python": {
        "files": {
          "main.py": "import pandas as pd\n\nsales = pd.DataFrame({\n    \"region\": [\"North\", \"South\", \"North\", \"West\", \"South\", \"West\", \"North\", \"South\", \"West\", \"North\"],\n    \"category\": [\"Laptop\", \"Phone\", \"Phone\", \"Laptop\", \"Laptop\", \"Phone\", \"Laptop\", \"Phone\", \"Tablet\", \"Tablet\"],\n    \"rep\": [\"Amit\", \"Sara\", \"Amit\", \"Ravi\", \"Sara\", \"Ravi\", \"Neha\", \"Kiran\", \"Ravi\", \"Neha\"],\n    \"units\": [3, 10, 8, 2, 4, 12, 5, 6, 7, 4],\n    \"revenue\": [165000, 150000, 112000, 118000, 216000, 174000, 270000, 87000, 98000, 60000],\n})\n\npt = pd.pivot_table(sales, index=\"region\", columns=\"category\", values=\"revenue\",\n                    aggfunc=\"sum\", fill_value=0, margins=True, margins_name=\"Total\")\nprint(pt)\n\nprint(pd.crosstab(sales[\"region\"], sales[\"category\"]))\nprint((pd.crosstab(sales[\"region\"], sales[\"category\"], normalize=\"index\") * 100).round(1))\n"
        }
      },
      "result": "category  Laptop   Phone  Tablet    Total\nregion                                   \nNorth     435000  112000   60000   607000\nSouth     216000  237000       0   453000\nWest      118000  174000   98000   390000\nTotal     769000  523000  158000  1450000\ncategory  Laptop  Phone  Tablet\nregion                         \nNorth          2      1       1\nSouth          1      2       0\nWest           1      1       1\ncategory  Laptop  Phone  Tablet\nregion                         \nNorth       50.0   25.0    25.0\nSouth       33.3   66.7     0.0\nWest        33.3   33.3    33.3",
      "explanation": "pivot_table aggregates revenue for every region-category pair, fill_value=0 replaces combinations with no sales, and margins=True adds a Total row and column (grand total 14,50,000). crosstab counts orders per combination; normalize='index' turns each row into percentages that add up to 100."
    },
    {
      "title": "Reshaping: melt, unstack and stack",
      "scenario": "Monthly sales arrive in wide format (one column per month). Convert to long format for analysis, then back to wide with unstack.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import pandas as pd\n\nwide = pd.DataFrame({\n    \"product\": [\"Pen\", \"Notebook\", \"Bag\"],\n    \"Jan\": [500, 300, 40],\n    \"Feb\": [450, 320, 55],\n    \"Mar\": [520, 310, 60],\n})\nlong = wide.melt(id_vars=\"product\", var_name=\"month\", value_name=\"units\")\nprint(long)\nprint(long.groupby(\"month\", sort=False)[\"units\"].sum())\n\nback = long.set_index([\"product\", \"month\"])[\"units\"].unstack()\nprint(back[[\"Jan\", \"Feb\", \"Mar\"]])\nprint(back.stack().head(3))\n",
      "python": {
        "files": {
          "main.py": "import pandas as pd\n\nwide = pd.DataFrame({\n    \"product\": [\"Pen\", \"Notebook\", \"Bag\"],\n    \"Jan\": [500, 300, 40],\n    \"Feb\": [450, 320, 55],\n    \"Mar\": [520, 310, 60],\n})\nlong = wide.melt(id_vars=\"product\", var_name=\"month\", value_name=\"units\")\nprint(long)\nprint(long.groupby(\"month\", sort=False)[\"units\"].sum())\n\nback = long.set_index([\"product\", \"month\"])[\"units\"].unstack()\nprint(back[[\"Jan\", \"Feb\", \"Mar\"]])\nprint(back.stack().head(3))\n"
        }
      },
      "result": "    product month  units\n0       Pen   Jan    500\n1  Notebook   Jan    300\n2       Bag   Jan     40\n3       Pen   Feb    450\n4  Notebook   Feb    320\n5       Bag   Feb     55\n6       Pen   Mar    520\n7  Notebook   Mar    310\n8       Bag   Mar     60\nmonth\nJan    840\nFeb    825\nMar    890\nName: units, dtype: int64\nmonth     Jan  Feb  Mar\nproduct                \nBag        40   55   60\nNotebook  300  320  310\nPen       500  450  520\nproduct  month\nBag      Feb      55\n         Jan      40\n         Mar      60\ndtype: int64",
      "explanation": "melt keeps 'product' as an identifier and turns the month columns into rows (3 products x 3 months = 9 rows). Long format is easy to group and plot. set_index + unstack moves the month level back into columns (alphabetical order, so we reorder them). stack does the reverse, producing a Series with a MultiIndex."
    }
  ],
  "interview": [
    {
      "q": "Explain groupby in pandas with an example.",
      "a": "groupby splits rows into groups by key columns, applies a function to each group and combines the results (split-apply-combine). Example: df.groupby('dept')['salary'].mean() gives average salary per department, equivalent to SQL SELECT dept, AVG(salary) FROM emp GROUP BY dept.",
      "level": "Easy"
    },
    {
      "q": "What is the difference between count(), size() and nunique() in groupby?",
      "a": "count() counts non-null values per column; size() counts all rows per group including nulls (returns a Series); nunique() counts distinct non-null values.",
      "level": "Medium"
    },
    {
      "q": "What is the difference between agg, transform and apply?",
      "a": "agg reduces each group to one value per function (one row per group). transform returns an object the same size as the input, broadcasting group results back to each row. apply is the most flexible: it runs any function on each group DataFrame and can return a scalar, Series or DataFrame, but it is the slowest.",
      "level": "Hard"
    },
    {
      "q": "How do you rename aggregated columns cleanly?",
      "a": "Use named aggregation: df.groupby('region').agg(total=('revenue', 'sum'), orders=('order_id', 'count')). This avoids MultiIndex columns created by agg({'revenue': ['sum', 'mean']}).",
      "level": "Medium"
    },
    {
      "q": "How do you get the top 2 products by revenue in each category?",
      "a": "df.sort_values('revenue', ascending=False).groupby('category').head(2). Alternative: df[df.groupby('category')['revenue'].rank(ascending=False, method='first') <= 2].",
      "level": "Hard"
    },
    {
      "q": "Difference between pivot and pivot_table?",
      "a": "pivot only reshapes and requires unique index/column combinations (raises ValueError on duplicates). pivot_table aggregates duplicates with aggfunc (default mean), and supports fill_value and margins.",
      "level": "Medium"
    },
    {
      "q": "What does margins=True do in pivot_table?",
      "a": "It adds an 'All' row and column (rename with margins_name) containing totals computed with the same aggfunc - like Grand Totals in Excel.",
      "level": "Easy"
    },
    {
      "q": "What is crosstab and when do you use it?",
      "a": "pd.crosstab computes a frequency table of two (or more) categorical variables, e.g. gender vs department. With values= and aggfunc= it can aggregate; normalize='index'/'columns'/'all' gives percentages.",
      "level": "Medium"
    },
    {
      "q": "How do you calculate each employee's salary as a percentage of their department total?",
      "a": "df['pct'] = df['salary'] / df.groupby('dept')['salary'].transform('sum') * 100. transform keeps the original row count, so no merge is needed.",
      "level": "Medium"
    },
    {
      "q": "What is the difference between melt and pivot?",
      "a": "melt converts wide to long (columns become rows: id_vars stay, other columns become variable/value pairs). pivot/pivot_table converts long to wide. They are inverse operations.",
      "level": "Medium"
    },
    {
      "q": "How do you keep only groups with more than 5 rows?",
      "a": "df.groupby('customer').filter(lambda g: len(g) > 5), or faster: df[df.groupby('customer')['order_id'].transform('size') > 5].",
      "level": "Hard"
    },
    {
      "q": "Why does a groupby result have the key as the index and how do you change it?",
      "a": "pandas uses the group keys as the index by default (as_index=True). Use as_index=False in groupby or call .reset_index() on the result to get them as regular columns.",
      "level": "Easy"
    }
  ],
  "practice": [
    {
      "task": "For an employee table (name, dept, gender, salary), compute average salary per department rounded to 0 decimals, sorted descending.",
      "hint": "groupby('dept')['salary'].mean().round(0).sort_values(ascending=False)",
      "solution": "import pandas as pd\n\nemp = pd.DataFrame({\n    \"name\": [\"Asha\", \"Vikram\", \"Neha\", \"Arjun\", \"Pooja\", \"Ravi\"],\n    \"dept\": [\"IT\", \"HR\", \"IT\", \"Sales\", \"Sales\", \"IT\"],\n    \"gender\": [\"F\", \"M\", \"F\", \"M\", \"F\", \"M\"],\n    \"salary\": [65000, 42000, 72000, 48000, 51000, 58000],\n})\nprint(emp.groupby(\"dept\")[\"salary\"].mean().round(0).sort_values(ascending=False))\n"
    },
    {
      "task": "Using the same table, create a named-aggregation summary per department with headcount, total salary, min and max salary.",
      "hint": "agg(headcount=('name', 'count'), total=('salary', 'sum'), ...)",
      "solution": "import pandas as pd\n\nemp = pd.DataFrame({\n    \"dept\": [\"IT\", \"HR\", \"IT\", \"Sales\", \"Sales\", \"IT\"],\n    \"name\": [\"Asha\", \"Vikram\", \"Neha\", \"Arjun\", \"Pooja\", \"Ravi\"],\n    \"salary\": [65000, 42000, 72000, 48000, 51000, 58000],\n})\nprint(emp.groupby(\"dept\", as_index=False).agg(\n    headcount=(\"name\", \"count\"), total=(\"salary\", \"sum\"),\n    min_sal=(\"salary\", \"min\"), max_sal=(\"salary\", \"max\")))\n"
    },
    {
      "task": "Add a column showing how much each employee's salary differs from their department average.",
      "hint": "salary - groupby('dept')['salary'].transform('mean')",
      "solution": "import pandas as pd\n\nemp = pd.DataFrame({\n    \"dept\": [\"IT\", \"HR\", \"IT\", \"Sales\", \"Sales\", \"IT\"],\n    \"salary\": [65000, 42000, 72000, 48000, 51000, 58000],\n})\nemp[\"diff_from_avg\"] = emp[\"salary\"] - emp.groupby(\"dept\")[\"salary\"].transform(\"mean\")\nprint(emp)\n"
    },
    {
      "task": "Create a pivot table of student marks with subject as rows, class (A/B) as columns, mean marks as values, and an overall total margin.",
      "hint": "pd.pivot_table(df, index='subject', columns='class', values='marks', aggfunc='mean', margins=True)",
      "solution": "import pandas as pd\n\ndf = pd.DataFrame({\n    \"class\": [\"A\", \"A\", \"B\", \"B\", \"A\", \"B\"],\n    \"subject\": [\"Maths\", \"Science\", \"Maths\", \"Science\", \"Maths\", \"Maths\"],\n    \"marks\": [78, 85, 69, 90, 88, 74],\n})\nprint(pd.pivot_table(df, index=\"subject\", columns=\"class\", values=\"marks\",\n                     aggfunc=\"mean\", margins=True).round(1))\n"
    },
    {
      "task": "For an orders table with payment_mode and city, show a crosstab of counts and another with column percentages.",
      "hint": "pd.crosstab(df.city, df.payment_mode, normalize='columns')",
      "solution": "import pandas as pd\n\ndf = pd.DataFrame({\n    \"city\": [\"Pune\", \"Mumbai\", \"Pune\", \"Delhi\", \"Mumbai\", \"Pune\"],\n    \"payment_mode\": [\"UPI\", \"Card\", \"UPI\", \"COD\", \"UPI\", \"Card\"],\n})\nprint(pd.crosstab(df[\"city\"], df[\"payment_mode\"]))\nprint((pd.crosstab(df[\"city\"], df[\"payment_mode\"], normalize=\"columns\") * 100).round(1))\n"
    }
  ],
  "quiz": [
    {
      "question": "df.groupby('dept')['salary'].transform('mean') returns:",
      "options": [
        "One row per department",
        "A Series with the same length as df",
        "A scalar",
        "A pivot table"
      ],
      "answer": 1,
      "explanation": "transform broadcasts each group's result back to every row of that group."
    },
    {
      "question": "Which counts rows per group including missing values?",
      "options": [
        "count()",
        "size()",
        "nunique()",
        "sum()"
      ],
      "answer": 1,
      "explanation": "size() counts all rows; count() skips NaN."
    },
    {
      "question": "What is the default aggfunc of pd.pivot_table?",
      "options": [
        "sum",
        "count",
        "mean",
        "max"
      ],
      "answer": 2,
      "explanation": "pivot_table aggregates with mean unless aggfunc is specified."
    },
    {
      "question": "Which parameter adds grand totals to a pivot_table?",
      "options": [
        "totals=True",
        "margins=True",
        "grand=True",
        "fill_value=0"
      ],
      "answer": 1,
      "explanation": "margins=True adds an All row and column."
    },
    {
      "question": "Which function converts wide data (one column per month) into long format?",
      "options": [
        "pivot",
        "melt",
        "unstack",
        "crosstab"
      ],
      "answer": 1,
      "explanation": "melt unpivots columns into variable/value rows."
    },
    {
      "question": "How do you return the group keys as normal columns?",
      "options": [
        "sort=False",
        "as_index=False",
        "dropna=False",
        "observed=True"
      ],
      "answer": 1,
      "explanation": "as_index=False (or reset_index()) keeps keys as columns."
    }
  ]
};
