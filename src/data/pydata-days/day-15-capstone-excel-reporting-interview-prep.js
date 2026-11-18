export default {
  "id": "day-15-capstone-excel-reporting-interview-prep",
  "title": "Capstone Data Analysis Project, Reporting to Excel and Data Analyst Interview Preparation",
  "module": "Module 4: Projects",
  "day": 15,
  "level": "Advanced",
  "duration": "5 hours",
  "summary": "Complete a capstone analysis for a retail chain: combine three tables, compute revenue, profit, margin and target achievement, answer business questions, and deliver a formatted multi-sheet Excel report with a chart. Finish with a data analyst interview kit: common pandas coding problems, how to present projects, and a revision checklist for NumPy, pandas and visualization.",
  "objectives": [
    "Plan and execute a capstone project from problem statement to deliverables",
    "Merge fact and dimension tables and compute revenue, profit, margin and target achievement",
    "Answer business questions with groupby, pivot_table, ranking and time analysis",
    "Export a formatted multi-sheet Excel report (column widths, number formats, frozen header, chart)",
    "Solve common pandas interview problems and present your project using the STAR method"
  ],
  "theory": [
    {
      "heading": "Capstone Project Brief",
      "content": "**Company:** a grocery retail chain with 5 stores in 3 regions. **Data:** daily sales lines (date, store, product, quantity) for January-June 2024, a store table, a product table (price and cost) and half-year targets per store.\n\n**Business questions from the Head of Sales:**",
      "points": [
        "1. What are total revenue, profit and margin % for H1 2024?",
        "2. Which stores met their H1 targets? Which are behind and by how much?",
        "3. Which categories and products make the most profit (not just revenue)?",
        "4. What is the monthly trend and month-over-month growth per region?",
        "5. What is the best-selling product in each region?",
        "6. Deliver an Excel report the management team can open without Python"
      ],
      "tip": "Put this brief at the top of your notebook and in your GitHub README. Recruiters read the README first, so state the problem, data, tools, key insights and a screenshot."
    },
    {
      "heading": "Project Structure and Deliverables",
      "content": "A professional analysis project has a clear folder structure and reproducible steps.",
      "points": [
        "`data/raw/` - original files (never edit them), `data/processed/` - cleaned outputs",
        "`notebooks/01_cleaning.ipynb`, `02_eda.ipynb`, `03_report.ipynb` - one purpose each",
        "`reports/` - Excel report, charts (PNG) and a short PDF/PowerPoint summary",
        "`README.md` - problem, dataset, approach, key insights, how to run, screenshots",
        "`requirements.txt` - pandas, numpy, matplotlib, seaborn, openpyxl versions",
        "Deliverables: KPI summary, 4-6 charts, Excel report, 3-5 insights with recommendations"
      ]
    },
    {
      "heading": "Reporting to Excel with pandas and openpyxl",
      "content": "Managers live in Excel, so exporting a clean workbook is a core analyst skill. `pd.ExcelWriter(path, engine='openpyxl')` writes several DataFrames to separate sheets. After writing, you can access the openpyxl worksheet (`writer.sheets['Summary']`) to format it.",
      "syntax": "with pd.ExcelWriter('report.xlsx', engine='openpyxl') as writer:\n    kpi.to_excel(writer, sheet_name='Summary', index=False)\n    store.to_excel(writer, sheet_name='Stores', index=False)\n    ws = writer.sheets['Stores']\n    ws.freeze_panes = 'A2'                       # keep header visible\n    ws.column_dimensions['B'].width = 18          # column width\n    for cell in ws['C'][1:]:\n        cell.number_format = '#,##0'              # thousands separator\n    ws.auto_filter.ref = ws.dimensions           # add filter buttons",
      "points": [
        "`index=False` unless the index is meaningful",
        "Number formats: '#,##0' (integer), '#,##0.00', '0.0%' (percent - store 0.25 not 25)",
        "Bold header: `cell.font = Font(bold=True)` from openpyxl.styles",
        "Insert a Matplotlib chart: save PNG, then `ws.add_image(openpyxl.drawing.image.Image('chart.png'), 'H2')`",
        "Alternative engine: xlsxwriter (rich formatting and native Excel charts) - but it cannot read files",
        "Also export CSV for other systems and Parquet for large data"
      ]
    },
    {
      "heading": "Profit, Margin and Target KPIs",
      "content": "Revenue alone can mislead: a product with high revenue but thin margin may contribute less profit than a smaller product with high margin.",
      "points": [
        "**Revenue** = qty x price",
        "**Profit (gross)** = qty x (price - cost)",
        "**Margin %** = profit / revenue x 100",
        "**Target achievement %** = actual / target x 100; **Gap** = target - actual",
        "**Contribution %** = segment profit / total profit x 100",
        "**Rank within group**: `groupby(...).rank(ascending=False, method='dense')`"
      ]
    },
    {
      "heading": "Data Analyst Interview: What to Expect",
      "content": "Typical interview rounds for fresher/junior data analyst roles in India (service companies, product startups, banks, e-commerce, consulting):",
      "points": [
        "**Online test** - aptitude, SQL queries, Excel functions, basic statistics, sometimes Python MCQs",
        "**Technical round** - live SQL and pandas coding (top N per group, second highest, running totals, joins, pivot), Excel (XLOOKUP, pivot tables), statistics (mean vs median, outliers, correlation vs causation)",
        "**Case / guesstimate round** - 'Sales dropped 15% last month, how will you investigate?', 'Estimate daily orders of a food delivery app in Pune'",
        "**Project discussion** - explain your capstone with the STAR method: Situation, Task, Action (tools, steps), Result (numbers, insights)",
        "**HR round** - communication, why data analytics, relocation, notice period"
      ],
      "tip": "Prepare a 2-minute project pitch: business problem -> data -> cleaning issues found -> 3 key insights with numbers -> recommendation -> tools used. Practise it aloud."
    },
    {
      "heading": "Revision Checklist: Python for Data Analysis",
      "content": "Before interviews, make sure you can write these from memory:",
      "points": [
        "NumPy: array creation, shape/reshape, boolean masks, np.where/np.select, axis aggregations, broadcasting",
        "pandas basics: read_csv/read_excel, head/info/describe, loc/iloc, query, isin, between, sort_values",
        "Cleaning: isna/fillna/dropna, drop_duplicates, astype/to_numeric/to_datetime, str methods, IQR outliers",
        "Analysis: groupby + agg (named), transform, pivot_table, crosstab, merge (all join types), concat",
        "Time series: dt accessor, resample, rolling, shift, pct_change",
        "Visualization: line/bar/hist/scatter/box with Matplotlib, Seaborn hue, heatmap, choosing the right chart",
        "Performance: vectorization vs apply, category dtype",
        "Communication: KPI definitions, insight = what + so what + now what"
      ]
    }
  ],
  "examples": [
    {
      "title": "Capstone Step 1 - Combine Tables and Headline KPIs",
      "scenario": "Merge the sales lines with the store and product tables, then answer Question 1: total revenue, profit and margin for H1 2024.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import numpy as np\nimport pandas as pd\n\n# ---- Capstone data: a retail chain with 3 tables (star schema) ----\nrng = np.random.default_rng(15)\nstores = pd.DataFrame({\"store_id\": [\"S1\", \"S2\", \"S3\", \"S4\", \"S5\"],\n                       \"city\": [\"Mumbai\", \"Pune\", \"Delhi\", \"Jaipur\", \"Bengaluru\"],\n                       \"region\": [\"West\", \"West\", \"North\", \"North\", \"South\"]})\nproducts = pd.DataFrame({\"sku\": [\"P1\", \"P2\", \"P3\", \"P4\", \"P5\", \"P6\"],\n                         \"product\": [\"Rice 5kg\", \"Atta 10kg\", \"Oil 1L\", \"Tea 500g\", \"Soap Pack\", \"Detergent 2kg\"],\n                         \"category\": [\"Staples\", \"Staples\", \"Staples\", \"Beverages\", \"Personal Care\", \"Home Care\"],\n                         \"price\": [450, 520, 180, 260, 150, 390],\n                         \"cost\": [380, 440, 150, 190, 95, 300]})\nn = 3000\nsales = pd.DataFrame({\n    \"date\": pd.Timestamp(\"2024-01-01\") + pd.to_timedelta(rng.integers(0, 182, n), unit=\"D\"),\n    \"store_id\": rng.choice(stores[\"store_id\"], n, p=[0.3, 0.2, 0.25, 0.1, 0.15]),\n    \"sku\": rng.choice(products[\"sku\"], n),\n    \"qty\": rng.integers(1, 6, n),\n})\ntargets = pd.DataFrame({\"store_id\": [\"S1\", \"S2\", \"S3\", \"S4\", \"S5\"],\n                        \"h1_target\": [800000, 600000, 780000, 300000, 420000]})\n\ndf = (sales.merge(stores, on=\"store_id\", how=\"left\", validate=\"many_to_one\")\n           .merge(products, on=\"sku\", how=\"left\", validate=\"many_to_one\"))\ndf[\"revenue\"] = df[\"qty\"] * df[\"price\"]\ndf[\"profit\"] = df[\"qty\"] * (df[\"price\"] - df[\"cost\"])\ndf[\"month\"] = df[\"date\"].dt.to_period(\"M\").astype(str)\n\nprint(\"Rows:\", len(df), \"| unmatched stores:\", df[\"city\"].isna().sum(),\n      \"| unmatched products:\", df[\"product\"].isna().sum())\nprint(\"Period:\", df[\"date\"].min().date(), \"to\", df[\"date\"].max().date())\nrevenue, profit = df[\"revenue\"].sum(), df[\"profit\"].sum()\nprint(f\"Revenue: Rs {revenue:,}\")\nprint(f\"Profit : Rs {profit:,}\")\nprint(f\"Margin : {profit / revenue:.1%}\")\nprint(f\"Units  : {df['qty'].sum():,}\")\n",
      "python": {
        "files": {
          "main.py": "import numpy as np\nimport pandas as pd\n\n# ---- Capstone data: a retail chain with 3 tables (star schema) ----\nrng = np.random.default_rng(15)\nstores = pd.DataFrame({\"store_id\": [\"S1\", \"S2\", \"S3\", \"S4\", \"S5\"],\n                       \"city\": [\"Mumbai\", \"Pune\", \"Delhi\", \"Jaipur\", \"Bengaluru\"],\n                       \"region\": [\"West\", \"West\", \"North\", \"North\", \"South\"]})\nproducts = pd.DataFrame({\"sku\": [\"P1\", \"P2\", \"P3\", \"P4\", \"P5\", \"P6\"],\n                         \"product\": [\"Rice 5kg\", \"Atta 10kg\", \"Oil 1L\", \"Tea 500g\", \"Soap Pack\", \"Detergent 2kg\"],\n                         \"category\": [\"Staples\", \"Staples\", \"Staples\", \"Beverages\", \"Personal Care\", \"Home Care\"],\n                         \"price\": [450, 520, 180, 260, 150, 390],\n                         \"cost\": [380, 440, 150, 190, 95, 300]})\nn = 3000\nsales = pd.DataFrame({\n    \"date\": pd.Timestamp(\"2024-01-01\") + pd.to_timedelta(rng.integers(0, 182, n), unit=\"D\"),\n    \"store_id\": rng.choice(stores[\"store_id\"], n, p=[0.3, 0.2, 0.25, 0.1, 0.15]),\n    \"sku\": rng.choice(products[\"sku\"], n),\n    \"qty\": rng.integers(1, 6, n),\n})\ntargets = pd.DataFrame({\"store_id\": [\"S1\", \"S2\", \"S3\", \"S4\", \"S5\"],\n                        \"h1_target\": [800000, 600000, 780000, 300000, 420000]})\n\ndf = (sales.merge(stores, on=\"store_id\", how=\"left\", validate=\"many_to_one\")\n           .merge(products, on=\"sku\", how=\"left\", validate=\"many_to_one\"))\ndf[\"revenue\"] = df[\"qty\"] * df[\"price\"]\ndf[\"profit\"] = df[\"qty\"] * (df[\"price\"] - df[\"cost\"])\ndf[\"month\"] = df[\"date\"].dt.to_period(\"M\").astype(str)\n\nprint(\"Rows:\", len(df), \"| unmatched stores:\", df[\"city\"].isna().sum(),\n      \"| unmatched products:\", df[\"product\"].isna().sum())\nprint(\"Period:\", df[\"date\"].min().date(), \"to\", df[\"date\"].max().date())\nrevenue, profit = df[\"revenue\"].sum(), df[\"profit\"].sum()\nprint(f\"Revenue: Rs {revenue:,}\")\nprint(f\"Profit : Rs {profit:,}\")\nprint(f\"Margin : {profit / revenue:.1%}\")\nprint(f\"Units  : {df['qty'].sum():,}\")\n"
        }
      },
      "result": "Rows: 3000 | unmatched stores: 0 | unmatched products: 0\nPeriod: 2024-01-01 to 2024-06-30\nRevenue: Rs 2,943,160\nProfit : Rs 598,450\nMargin : 20.3%\nUnits  : 9,006",
      "explanation": "The sales table is the fact table; stores and products are dimension tables. Left merges with validate='many_to_one' guarantee each sales line matches at most one store and one product, so no rows are duplicated, and counting NaNs confirms every key matched. Revenue and profit are computed per line and summed; margin is total profit divided by total revenue (not the average of line margins)."
    },
    {
      "title": "Capstone Step 2 - Targets, Profit Drivers and Regional Trends",
      "scenario": "Answer Questions 2-5: target achievement per store, profit by category, monthly MoM growth per region, and the best-selling product in each region.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import numpy as np\nimport pandas as pd\n\n# ---- Capstone data: a retail chain with 3 tables (star schema) ----\nrng = np.random.default_rng(15)\nstores = pd.DataFrame({\"store_id\": [\"S1\", \"S2\", \"S3\", \"S4\", \"S5\"],\n                       \"city\": [\"Mumbai\", \"Pune\", \"Delhi\", \"Jaipur\", \"Bengaluru\"],\n                       \"region\": [\"West\", \"West\", \"North\", \"North\", \"South\"]})\nproducts = pd.DataFrame({\"sku\": [\"P1\", \"P2\", \"P3\", \"P4\", \"P5\", \"P6\"],\n                         \"product\": [\"Rice 5kg\", \"Atta 10kg\", \"Oil 1L\", \"Tea 500g\", \"Soap Pack\", \"Detergent 2kg\"],\n                         \"category\": [\"Staples\", \"Staples\", \"Staples\", \"Beverages\", \"Personal Care\", \"Home Care\"],\n                         \"price\": [450, 520, 180, 260, 150, 390],\n                         \"cost\": [380, 440, 150, 190, 95, 300]})\nn = 3000\nsales = pd.DataFrame({\n    \"date\": pd.Timestamp(\"2024-01-01\") + pd.to_timedelta(rng.integers(0, 182, n), unit=\"D\"),\n    \"store_id\": rng.choice(stores[\"store_id\"], n, p=[0.3, 0.2, 0.25, 0.1, 0.15]),\n    \"sku\": rng.choice(products[\"sku\"], n),\n    \"qty\": rng.integers(1, 6, n),\n})\ntargets = pd.DataFrame({\"store_id\": [\"S1\", \"S2\", \"S3\", \"S4\", \"S5\"],\n                        \"h1_target\": [800000, 600000, 780000, 300000, 420000]})\n\ndf = (sales.merge(stores, on=\"store_id\", how=\"left\", validate=\"many_to_one\")\n           .merge(products, on=\"sku\", how=\"left\", validate=\"many_to_one\"))\ndf[\"revenue\"] = df[\"qty\"] * df[\"price\"]\ndf[\"profit\"] = df[\"qty\"] * (df[\"price\"] - df[\"cost\"])\ndf[\"month\"] = df[\"date\"].dt.to_period(\"M\").astype(str)\n\nstore = df.groupby([\"store_id\", \"city\"], as_index=False)[\"revenue\"].sum().merge(targets, on=\"store_id\")\nstore[\"achieved_pct\"] = (store[\"revenue\"] / store[\"h1_target\"] * 100).round(1)\nstore[\"gap\"] = (store[\"h1_target\"] - store[\"revenue\"]).clip(lower=0)\nprint(store.sort_values(\"achieved_pct\", ascending=False).to_string(index=False))\n\ncat = df.groupby(\"category\").agg(revenue=(\"revenue\", \"sum\"), profit=(\"profit\", \"sum\"))\ncat[\"margin_pct\"] = (cat[\"profit\"] / cat[\"revenue\"] * 100).round(1)\nprint(cat.sort_values(\"profit\", ascending=False))\n\nmonthly = df.pivot_table(index=\"month\", columns=\"region\", values=\"revenue\", aggfunc=\"sum\")\nprint((monthly.pct_change() * 100).round(1).tail(3))\n\nunits = df.groupby([\"region\", \"product\"])[\"qty\"].sum().reset_index()\nunits[\"rank\"] = units.groupby(\"region\")[\"qty\"].rank(ascending=False, method=\"dense\")\nprint(units[units[\"rank\"] == 1].drop(columns=\"rank\").to_string(index=False))\n",
      "python": {
        "files": {
          "main.py": "import numpy as np\nimport pandas as pd\n\n# ---- Capstone data: a retail chain with 3 tables (star schema) ----\nrng = np.random.default_rng(15)\nstores = pd.DataFrame({\"store_id\": [\"S1\", \"S2\", \"S3\", \"S4\", \"S5\"],\n                       \"city\": [\"Mumbai\", \"Pune\", \"Delhi\", \"Jaipur\", \"Bengaluru\"],\n                       \"region\": [\"West\", \"West\", \"North\", \"North\", \"South\"]})\nproducts = pd.DataFrame({\"sku\": [\"P1\", \"P2\", \"P3\", \"P4\", \"P5\", \"P6\"],\n                         \"product\": [\"Rice 5kg\", \"Atta 10kg\", \"Oil 1L\", \"Tea 500g\", \"Soap Pack\", \"Detergent 2kg\"],\n                         \"category\": [\"Staples\", \"Staples\", \"Staples\", \"Beverages\", \"Personal Care\", \"Home Care\"],\n                         \"price\": [450, 520, 180, 260, 150, 390],\n                         \"cost\": [380, 440, 150, 190, 95, 300]})\nn = 3000\nsales = pd.DataFrame({\n    \"date\": pd.Timestamp(\"2024-01-01\") + pd.to_timedelta(rng.integers(0, 182, n), unit=\"D\"),\n    \"store_id\": rng.choice(stores[\"store_id\"], n, p=[0.3, 0.2, 0.25, 0.1, 0.15]),\n    \"sku\": rng.choice(products[\"sku\"], n),\n    \"qty\": rng.integers(1, 6, n),\n})\ntargets = pd.DataFrame({\"store_id\": [\"S1\", \"S2\", \"S3\", \"S4\", \"S5\"],\n                        \"h1_target\": [800000, 600000, 780000, 300000, 420000]})\n\ndf = (sales.merge(stores, on=\"store_id\", how=\"left\", validate=\"many_to_one\")\n           .merge(products, on=\"sku\", how=\"left\", validate=\"many_to_one\"))\ndf[\"revenue\"] = df[\"qty\"] * df[\"price\"]\ndf[\"profit\"] = df[\"qty\"] * (df[\"price\"] - df[\"cost\"])\ndf[\"month\"] = df[\"date\"].dt.to_period(\"M\").astype(str)\n\nstore = df.groupby([\"store_id\", \"city\"], as_index=False)[\"revenue\"].sum().merge(targets, on=\"store_id\")\nstore[\"achieved_pct\"] = (store[\"revenue\"] / store[\"h1_target\"] * 100).round(1)\nstore[\"gap\"] = (store[\"h1_target\"] - store[\"revenue\"]).clip(lower=0)\nprint(store.sort_values(\"achieved_pct\", ascending=False).to_string(index=False))\n\ncat = df.groupby(\"category\").agg(revenue=(\"revenue\", \"sum\"), profit=(\"profit\", \"sum\"))\ncat[\"margin_pct\"] = (cat[\"profit\"] / cat[\"revenue\"] * 100).round(1)\nprint(cat.sort_values(\"profit\", ascending=False))\n\nmonthly = df.pivot_table(index=\"month\", columns=\"region\", values=\"revenue\", aggfunc=\"sum\")\nprint((monthly.pct_change() * 100).round(1).tail(3))\n\nunits = df.groupby([\"region\", \"product\"])[\"qty\"].sum().reset_index()\nunits[\"rank\"] = units.groupby(\"region\")[\"qty\"].rank(ascending=False, method=\"dense\")\nprint(units[units[\"rank\"] == 1].drop(columns=\"rank\").to_string(index=False))\n"
        }
      },
      "result": "store_id      city  revenue  h1_target  achieved_pct   gap\n      S1    Mumbai   850680     800000         106.3     0\n      S3     Delhi   818350     780000         104.9     0\n      S5 Bengaluru   438590     420000         104.4     0\n      S2      Pune   565290     600000          94.2 34710\n      S4    Jaipur   270250     300000          90.1 29750\n               revenue  profit  margin_pct\ncategory                                  \nStaples        1710320  267470        15.6\nHome Care       625560  144360        23.1\nBeverages       369980   99610        26.9\nPersonal Care   237300   87010        36.7\nregion   North  South  West\nmonth                      \n2024-04    7.9  -11.6  12.4\n2024-05   -3.2   12.3  -3.2\n2024-06   -4.6   -6.1  -1.2\nregion       product  qty\n North     Soap Pack  636\n South     Atta 10kg  258\n  West Detergent 2kg  781",
      "explanation": "Store revenue is merged with targets to compute achievement % and the remaining gap (clip keeps it at 0 for stores that beat their target). The category table ranks by PROFIT and shows margin %, revealing which categories really make money. pivot_table + pct_change gives MoM growth per region, and a dense rank inside each region finds the top-selling product - the classic 'top N per group' interview pattern."
    },
    {
      "title": "Capstone Step 3 - Formatted Multi-Sheet Excel Report with a Chart",
      "scenario": "Deliver the results as H1_2024_Sales_Report.xlsx with Summary, Stores, Categories and Data sheets, formatted numbers, frozen headers, filters and an embedded chart.",
      "steps": [
        "Run on your machine or in Colab: pip install pandas openpyxl matplotlib",
        "Save the code as main.py in an empty folder and run: python main.py",
        "Open the generated Excel file and check the sheets, formats and chart"
      ],
      "code": "import numpy as np\nimport pandas as pd\n\n# ---- Capstone data: a retail chain with 3 tables (star schema) ----\nrng = np.random.default_rng(15)\nstores = pd.DataFrame({\"store_id\": [\"S1\", \"S2\", \"S3\", \"S4\", \"S5\"],\n                       \"city\": [\"Mumbai\", \"Pune\", \"Delhi\", \"Jaipur\", \"Bengaluru\"],\n                       \"region\": [\"West\", \"West\", \"North\", \"North\", \"South\"]})\nproducts = pd.DataFrame({\"sku\": [\"P1\", \"P2\", \"P3\", \"P4\", \"P5\", \"P6\"],\n                         \"product\": [\"Rice 5kg\", \"Atta 10kg\", \"Oil 1L\", \"Tea 500g\", \"Soap Pack\", \"Detergent 2kg\"],\n                         \"category\": [\"Staples\", \"Staples\", \"Staples\", \"Beverages\", \"Personal Care\", \"Home Care\"],\n                         \"price\": [450, 520, 180, 260, 150, 390],\n                         \"cost\": [380, 440, 150, 190, 95, 300]})\nn = 3000\nsales = pd.DataFrame({\n    \"date\": pd.Timestamp(\"2024-01-01\") + pd.to_timedelta(rng.integers(0, 182, n), unit=\"D\"),\n    \"store_id\": rng.choice(stores[\"store_id\"], n, p=[0.3, 0.2, 0.25, 0.1, 0.15]),\n    \"sku\": rng.choice(products[\"sku\"], n),\n    \"qty\": rng.integers(1, 6, n),\n})\ntargets = pd.DataFrame({\"store_id\": [\"S1\", \"S2\", \"S3\", \"S4\", \"S5\"],\n                        \"h1_target\": [800000, 600000, 780000, 300000, 420000]})\n\ndf = (sales.merge(stores, on=\"store_id\", how=\"left\", validate=\"many_to_one\")\n           .merge(products, on=\"sku\", how=\"left\", validate=\"many_to_one\"))\ndf[\"revenue\"] = df[\"qty\"] * df[\"price\"]\ndf[\"profit\"] = df[\"qty\"] * (df[\"price\"] - df[\"cost\"])\ndf[\"month\"] = df[\"date\"].dt.to_period(\"M\").astype(str)\nimport matplotlib\nmatplotlib.use(\"Agg\")\nimport matplotlib.pyplot as plt\nfrom openpyxl.styles import Font, PatternFill\nfrom openpyxl.drawing.image import Image\n\nkpi = pd.DataFrame({\"KPI\": [\"Revenue\", \"Profit\", \"Margin\", \"Units\"],\n                    \"Value\": [df[\"revenue\"].sum(), df[\"profit\"].sum(),\n                              df[\"profit\"].sum() / df[\"revenue\"].sum(), df[\"qty\"].sum()]})\nstore = df.groupby([\"store_id\", \"city\"], as_index=False)[\"revenue\"].sum().merge(targets, on=\"store_id\")\nstore[\"achieved\"] = store[\"revenue\"] / store[\"h1_target\"]\ncat = df.groupby(\"category\", as_index=False).agg(revenue=(\"revenue\", \"sum\"), profit=(\"profit\", \"sum\"))\n\nfig, ax = plt.subplots(figsize=(6, 3.5))\nax.bar(store[\"city\"], store[\"achieved\"] * 100, color=\"tab:blue\")\nax.axhline(100, color=\"red\", linestyle=\"--\")\nax.set_title(\"H1 Target Achievement %\")\nfig.tight_layout()\nfig.savefig(\"achievement.png\", dpi=100)\n\npath = \"H1_2024_Sales_Report.xlsx\"\nwith pd.ExcelWriter(path, engine=\"openpyxl\") as writer:\n    kpi.to_excel(writer, sheet_name=\"Summary\", index=False)\n    store.to_excel(writer, sheet_name=\"Stores\", index=False)\n    cat.to_excel(writer, sheet_name=\"Categories\", index=False)\n    df.drop(columns=\"month\").to_excel(writer, sheet_name=\"Data\", index=False)\n\n    for name, ws in writer.sheets.items():\n        ws.freeze_panes = \"A2\"\n        ws.auto_filter.ref = ws.dimensions\n        for cell in ws[1]:\n            cell.font = Font(bold=True, color=\"FFFFFF\")\n            cell.fill = PatternFill(\"solid\", fgColor=\"305496\")\n        for col in ws.columns:\n            ws.column_dimensions[col[0].column_letter].width = 16\n\n    ws = writer.sheets[\"Summary\"]\n    for row in range(2, 6):\n        ws.cell(row, 2).number_format = \"0.0%\" if row == 4 else \"#,##0\"\n    ws = writer.sheets[\"Stores\"]\n    for row in range(2, ws.max_row + 1):\n        ws.cell(row, 3).number_format = \"#,##0\"\n        ws.cell(row, 4).number_format = \"#,##0\"\n        ws.cell(row, 5).number_format = \"0.0%\"\n    ws.add_image(Image(\"achievement.png\"), \"H2\")\n\ncheck = pd.read_excel(path, sheet_name=None)\nfor name, sheet in check.items():\n    print(f\"{name:<11} {sheet.shape}\")\nprint(check[\"Stores\"][[\"city\", \"achieved\"]].round(3).to_string(index=False))\n",
      "result": "Summary     (4, 2)\nStores      (5, 5)\nCategories  (4, 3)\nData        (3000, 12)\n     city  achieved\n   Mumbai     1.063\n     Pune     0.942\n    Delhi     1.049\n   Jaipur     0.901\nBengaluru     1.044",
      "explanation": "ExcelWriter writes four DataFrames to four sheets. Through writer.sheets we get openpyxl worksheets and apply professional formatting: frozen header row, filter buttons, a bold white-on-blue header, column widths, thousands separators and percentage formats (stored as fractions like 1.05, displayed as 105.0%). The Matplotlib chart is saved as PNG and embedded with add_image. Reading the file back with sheet_name=None verifies the workbook - always test your deliverable before sending it."
    },
    {
      "title": "Interview Coding Problems in pandas",
      "scenario": "Solve five classic pandas questions asked in data analyst technical rounds: second highest salary, top-2 per department, running total, latest record per customer and percentage of total.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import pandas as pd\n\nemp = pd.DataFrame({\n    \"name\": [\"Asha\", \"Vikram\", \"Neha\", \"Arjun\", \"Pooja\", \"Ravi\", \"Kiran\"],\n    \"dept\": [\"IT\", \"HR\", \"IT\", \"Sales\", \"Sales\", \"IT\", \"HR\"],\n    \"salary\": [65000, 42000, 72000, 48000, 51000, 72000, 45000],\n})\n# Q1: second highest distinct salary\nprint(\"Q1:\", emp[\"salary\"].drop_duplicates().nlargest(2).iloc[-1])\n\n# Q2: top 2 earners per department\nemp[\"rnk\"] = emp.groupby(\"dept\")[\"salary\"].rank(method=\"dense\", ascending=False)\nprint(\"Q2:\"); print(emp[emp[\"rnk\"] <= 2].sort_values([\"dept\", \"rnk\"])[[\"dept\", \"name\", \"salary\"]].to_string(index=False))\n\n# Q3: running total of daily sales\ndaily = pd.Series([1200, 800, 1500, 950], index=pd.date_range(\"2024-04-01\", periods=4))\nprint(\"Q3:\", daily.cumsum().tolist())\n\n# Q4: latest record per customer\nlogins = pd.DataFrame({\"cust\": [\"A\", \"B\", \"A\", \"B\", \"C\"],\n                       \"ts\": pd.to_datetime([\"2024-04-01\", \"2024-04-02\", \"2024-04-05\",\n                                             \"2024-04-03\", \"2024-04-04\"])})\nprint(\"Q4:\"); print(logins.sort_values(\"ts\").drop_duplicates(\"cust\", keep=\"last\").to_string(index=False))\n\n# Q5: each department's share of the salary bill (%)\nprint(\"Q5:\", (emp.groupby(\"dept\")[\"salary\"].sum() / emp[\"salary\"].sum() * 100).round(1).to_dict())\n",
      "python": {
        "files": {
          "main.py": "import pandas as pd\n\nemp = pd.DataFrame({\n    \"name\": [\"Asha\", \"Vikram\", \"Neha\", \"Arjun\", \"Pooja\", \"Ravi\", \"Kiran\"],\n    \"dept\": [\"IT\", \"HR\", \"IT\", \"Sales\", \"Sales\", \"IT\", \"HR\"],\n    \"salary\": [65000, 42000, 72000, 48000, 51000, 72000, 45000],\n})\n# Q1: second highest distinct salary\nprint(\"Q1:\", emp[\"salary\"].drop_duplicates().nlargest(2).iloc[-1])\n\n# Q2: top 2 earners per department\nemp[\"rnk\"] = emp.groupby(\"dept\")[\"salary\"].rank(method=\"dense\", ascending=False)\nprint(\"Q2:\"); print(emp[emp[\"rnk\"] <= 2].sort_values([\"dept\", \"rnk\"])[[\"dept\", \"name\", \"salary\"]].to_string(index=False))\n\n# Q3: running total of daily sales\ndaily = pd.Series([1200, 800, 1500, 950], index=pd.date_range(\"2024-04-01\", periods=4))\nprint(\"Q3:\", daily.cumsum().tolist())\n\n# Q4: latest record per customer\nlogins = pd.DataFrame({\"cust\": [\"A\", \"B\", \"A\", \"B\", \"C\"],\n                       \"ts\": pd.to_datetime([\"2024-04-01\", \"2024-04-02\", \"2024-04-05\",\n                                             \"2024-04-03\", \"2024-04-04\"])})\nprint(\"Q4:\"); print(logins.sort_values(\"ts\").drop_duplicates(\"cust\", keep=\"last\").to_string(index=False))\n\n# Q5: each department's share of the salary bill (%)\nprint(\"Q5:\", (emp.groupby(\"dept\")[\"salary\"].sum() / emp[\"salary\"].sum() * 100).round(1).to_dict())\n"
        }
      },
      "result": "Q1: 65000\nQ2:\n dept   name  salary\n   HR  Kiran   45000\n   HR Vikram   42000\n   IT   Neha   72000\n   IT   Ravi   72000\n   IT   Asha   65000\nSales  Pooja   51000\nSales  Arjun   48000\nQ3: [1200, 2000, 3500, 4450]\nQ4:\ncust         ts\n   B 2024-04-03\n   C 2024-04-04\n   A 2024-04-05\nQ5: {'HR': 22.0, 'IT': 52.9, 'Sales': 25.1}",
      "explanation": "Q1 removes duplicate salaries first - otherwise the two 72,000 salaries would make 72,000 the 'second highest'. Q2 uses a dense rank inside each group (the pandas version of SQL DENSE_RANK() OVER (PARTITION BY dept)); IT has a tie at rank 1, so three IT employees qualify. Q3 is cumsum. Q4 sorts by time and keeps the last row per customer. Q5 divides group totals by the grand total. Practise explaining each line aloud, as interviewers ask 'why'."
    },
    {
      "title": "Presenting the Capstone: Auto-Generated Insight Summary",
      "scenario": "Turn the analysis into the 3-5 bullet executive summary you would put on the first slide, in the README and in your interview pitch.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import numpy as np\nimport pandas as pd\n\n# ---- Capstone data: a retail chain with 3 tables (star schema) ----\nrng = np.random.default_rng(15)\nstores = pd.DataFrame({\"store_id\": [\"S1\", \"S2\", \"S3\", \"S4\", \"S5\"],\n                       \"city\": [\"Mumbai\", \"Pune\", \"Delhi\", \"Jaipur\", \"Bengaluru\"],\n                       \"region\": [\"West\", \"West\", \"North\", \"North\", \"South\"]})\nproducts = pd.DataFrame({\"sku\": [\"P1\", \"P2\", \"P3\", \"P4\", \"P5\", \"P6\"],\n                         \"product\": [\"Rice 5kg\", \"Atta 10kg\", \"Oil 1L\", \"Tea 500g\", \"Soap Pack\", \"Detergent 2kg\"],\n                         \"category\": [\"Staples\", \"Staples\", \"Staples\", \"Beverages\", \"Personal Care\", \"Home Care\"],\n                         \"price\": [450, 520, 180, 260, 150, 390],\n                         \"cost\": [380, 440, 150, 190, 95, 300]})\nn = 3000\nsales = pd.DataFrame({\n    \"date\": pd.Timestamp(\"2024-01-01\") + pd.to_timedelta(rng.integers(0, 182, n), unit=\"D\"),\n    \"store_id\": rng.choice(stores[\"store_id\"], n, p=[0.3, 0.2, 0.25, 0.1, 0.15]),\n    \"sku\": rng.choice(products[\"sku\"], n),\n    \"qty\": rng.integers(1, 6, n),\n})\ntargets = pd.DataFrame({\"store_id\": [\"S1\", \"S2\", \"S3\", \"S4\", \"S5\"],\n                        \"h1_target\": [800000, 600000, 780000, 300000, 420000]})\n\ndf = (sales.merge(stores, on=\"store_id\", how=\"left\", validate=\"many_to_one\")\n           .merge(products, on=\"sku\", how=\"left\", validate=\"many_to_one\"))\ndf[\"revenue\"] = df[\"qty\"] * df[\"price\"]\ndf[\"profit\"] = df[\"qty\"] * (df[\"price\"] - df[\"cost\"])\ndf[\"month\"] = df[\"date\"].dt.to_period(\"M\").astype(str)\n\nstore = df.groupby(\"city\")[\"revenue\"].sum().to_frame().join(\n    targets.merge(stores, on=\"store_id\").set_index(\"city\")[\"h1_target\"])\nstore[\"pct\"] = store[\"revenue\"] / store[\"h1_target\"] * 100\nbehind = store[store[\"pct\"] < 100].sort_values(\"pct\")\ncat = df.groupby(\"category\")[[\"revenue\", \"profit\"]].sum()\ncat[\"margin\"] = cat[\"profit\"] / cat[\"revenue\"] * 100\nbest_margin = cat[\"margin\"].idxmax()\ntop_profit = cat[\"profit\"].idxmax()\nmonthly = df.groupby(\"month\")[\"revenue\"].sum()\n\nprint(\"H1 2024 RETAIL REPORT - KEY INSIGHTS\")\nprint(f\"1. Revenue Rs {df['revenue'].sum() / 1e5:.1f} lakh at {df['profit'].sum() / df['revenue'].sum():.1%} margin.\")\nprint(f\"2. {len(store) - len(behind)} of {len(store)} stores met target; most behind: \"\n      f\"{behind.index[0]} at {behind['pct'].iloc[0]:.0f}% (gap Rs {behind['h1_target'].iloc[0] - behind['revenue'].iloc[0]:,.0f}).\")\nprint(f\"3. {top_profit} earns the most profit, but {best_margin} has the best margin \"\n      f\"({cat.loc[best_margin, 'margin']:.0f}%) -> promote {best_margin} for profit growth.\")\nprint(f\"4. Best month {monthly.idxmax()}, weakest {monthly.idxmin()} \"\n      f\"({(monthly.max() / monthly.min() - 1) * 100:.0f}% apart) -> plan staffing and stock accordingly.\")\nprint(\"5. Recommendation: review pricing/assortment in under-target stores and track margin, not only revenue.\")\n",
      "python": {
        "files": {
          "main.py": "import numpy as np\nimport pandas as pd\n\n# ---- Capstone data: a retail chain with 3 tables (star schema) ----\nrng = np.random.default_rng(15)\nstores = pd.DataFrame({\"store_id\": [\"S1\", \"S2\", \"S3\", \"S4\", \"S5\"],\n                       \"city\": [\"Mumbai\", \"Pune\", \"Delhi\", \"Jaipur\", \"Bengaluru\"],\n                       \"region\": [\"West\", \"West\", \"North\", \"North\", \"South\"]})\nproducts = pd.DataFrame({\"sku\": [\"P1\", \"P2\", \"P3\", \"P4\", \"P5\", \"P6\"],\n                         \"product\": [\"Rice 5kg\", \"Atta 10kg\", \"Oil 1L\", \"Tea 500g\", \"Soap Pack\", \"Detergent 2kg\"],\n                         \"category\": [\"Staples\", \"Staples\", \"Staples\", \"Beverages\", \"Personal Care\", \"Home Care\"],\n                         \"price\": [450, 520, 180, 260, 150, 390],\n                         \"cost\": [380, 440, 150, 190, 95, 300]})\nn = 3000\nsales = pd.DataFrame({\n    \"date\": pd.Timestamp(\"2024-01-01\") + pd.to_timedelta(rng.integers(0, 182, n), unit=\"D\"),\n    \"store_id\": rng.choice(stores[\"store_id\"], n, p=[0.3, 0.2, 0.25, 0.1, 0.15]),\n    \"sku\": rng.choice(products[\"sku\"], n),\n    \"qty\": rng.integers(1, 6, n),\n})\ntargets = pd.DataFrame({\"store_id\": [\"S1\", \"S2\", \"S3\", \"S4\", \"S5\"],\n                        \"h1_target\": [800000, 600000, 780000, 300000, 420000]})\n\ndf = (sales.merge(stores, on=\"store_id\", how=\"left\", validate=\"many_to_one\")\n           .merge(products, on=\"sku\", how=\"left\", validate=\"many_to_one\"))\ndf[\"revenue\"] = df[\"qty\"] * df[\"price\"]\ndf[\"profit\"] = df[\"qty\"] * (df[\"price\"] - df[\"cost\"])\ndf[\"month\"] = df[\"date\"].dt.to_period(\"M\").astype(str)\n\nstore = df.groupby(\"city\")[\"revenue\"].sum().to_frame().join(\n    targets.merge(stores, on=\"store_id\").set_index(\"city\")[\"h1_target\"])\nstore[\"pct\"] = store[\"revenue\"] / store[\"h1_target\"] * 100\nbehind = store[store[\"pct\"] < 100].sort_values(\"pct\")\ncat = df.groupby(\"category\")[[\"revenue\", \"profit\"]].sum()\ncat[\"margin\"] = cat[\"profit\"] / cat[\"revenue\"] * 100\nbest_margin = cat[\"margin\"].idxmax()\ntop_profit = cat[\"profit\"].idxmax()\nmonthly = df.groupby(\"month\")[\"revenue\"].sum()\n\nprint(\"H1 2024 RETAIL REPORT - KEY INSIGHTS\")\nprint(f\"1. Revenue Rs {df['revenue'].sum() / 1e5:.1f} lakh at {df['profit'].sum() / df['revenue'].sum():.1%} margin.\")\nprint(f\"2. {len(store) - len(behind)} of {len(store)} stores met target; most behind: \"\n      f\"{behind.index[0]} at {behind['pct'].iloc[0]:.0f}% (gap Rs {behind['h1_target'].iloc[0] - behind['revenue'].iloc[0]:,.0f}).\")\nprint(f\"3. {top_profit} earns the most profit, but {best_margin} has the best margin \"\n      f\"({cat.loc[best_margin, 'margin']:.0f}%) -> promote {best_margin} for profit growth.\")\nprint(f\"4. Best month {monthly.idxmax()}, weakest {monthly.idxmin()} \"\n      f\"({(monthly.max() / monthly.min() - 1) * 100:.0f}% apart) -> plan staffing and stock accordingly.\")\nprint(\"5. Recommendation: review pricing/assortment in under-target stores and track margin, not only revenue.\")\n"
        }
      },
      "result": "H1 2024 RETAIL REPORT - KEY INSIGHTS\n1. Revenue Rs 29.4 lakh at 20.3% margin.\n2. 3 of 5 stores met target; most behind: Jaipur at 90% (gap Rs 29,750).\n3. Staples earns the most profit, but Personal Care has the best margin (37%) -> promote Personal Care for profit growth.\n4. Best month 2024-04, weakest 2024-01 (12% apart) -> plan staffing and stock accordingly.\n5. Recommendation: review pricing/assortment in under-target stores and track margin, not only revenue.",
      "explanation": "Insights are generated from the data, so the summary updates automatically if the data changes - no copy-paste errors. Each bullet follows 'what -> so what -> now what' and includes numbers. In interviews, present this summary first, then explain the method (merge, clean, KPIs, groupby/pivot, Excel report) and the tools - recruiters remember results, not code."
    }
  ],
  "interview": [
    {
      "q": "Tell me about a data analysis project you have done.",
      "a": "Use STAR: Situation - a 5-store retail chain wanted to understand H1 2024 performance. Task - measure revenue, profit, target achievement and drivers. Action - merged sales, store and product tables in pandas, validated joins, computed KPIs, analysed by store/category/month with groupby and pivot tables, built charts and a formatted Excel report. Result - found which stores missed targets and by how much, which category had the best margin, and recommended focus areas; the report is reusable each month.",
      "level": "Medium"
    },
    {
      "q": "How do you find the second highest salary in pandas?",
      "a": "df['salary'].drop_duplicates().nlargest(2).iloc[-1], or sorted unique values: sorted(df['salary'].unique())[-2]. For per-group: rank(method='dense', ascending=False) == 2 within groupby.",
      "level": "Easy"
    },
    {
      "q": "How do you get the top N records per group?",
      "a": "df.sort_values('value', ascending=False).groupby('group').head(N), or rank within groups: df[df.groupby('group')['value'].rank(method='dense', ascending=False) <= N] (dense rank keeps ties).",
      "level": "Medium"
    },
    {
      "q": "How do you export multiple DataFrames to one Excel file with different sheets?",
      "a": "with pd.ExcelWriter('report.xlsx', engine='openpyxl') as writer: df1.to_excel(writer, sheet_name='A', index=False); df2.to_excel(writer, sheet_name='B', index=False). Formatting is applied through writer.sheets[name] (openpyxl worksheet).",
      "level": "Easy"
    },
    {
      "q": "What is the difference between revenue, profit and margin?",
      "a": "Revenue is income from sales (qty x price). Profit is revenue minus cost. Margin % is profit divided by revenue x 100, showing how much of each rupee of sales is profit. A high-revenue product can have low margin.",
      "level": "Easy"
    },
    {
      "q": "Sales dropped 15% last month. How would you investigate?",
      "a": "Confirm the data (pipeline issues, missing days, definition changes). Decompose: revenue = orders x AOV; orders = traffic x conversion. Slice by region, store, channel, category, product and customer segment to find where the drop is concentrated. Check internal causes (stock-outs, price changes, app outage, fewer promotions) and external ones (seasonality, competitor sale, weather, holidays). Compare YoY to remove seasonality. Present the main driver with evidence and actions.",
      "level": "Hard"
    },
    {
      "q": "When would you use Python instead of Excel or Power BI?",
      "a": "Python for large data (millions of rows), complex cleaning, combining many files/APIs, repeatable automated pipelines, statistics and ML. Excel for quick ad-hoc analysis and sharing with business users. Power BI/Tableau for interactive dashboards. Often Python prepares the data and Excel/Power BI presents it.",
      "level": "Medium"
    },
    {
      "q": "What is the difference between correlation and causation?",
      "a": "Correlation means two variables move together; causation means one causes the other. Ice-cream sales and AC sales correlate because both are driven by summer heat. To claim causation you need controlled experiments (A/B tests) or careful causal analysis.",
      "level": "Medium"
    },
    {
      "q": "How do you validate that your analysis numbers are correct?",
      "a": "Reconcile totals with the source system or finance report; check row counts before/after each merge and filter; verify no duplicates or unmatched keys (indicator=True, validate=); spot-check a few records by hand; compare with previous reports; have a peer review the logic; recalculate key KPIs in Excel or SQL.",
      "level": "Hard"
    },
    {
      "q": "How would you automate a weekly sales report?",
      "a": "Write a Python script that reads the latest data (database/CSV/API), cleans and aggregates it, writes a formatted Excel file (and charts), and emails or uploads it. Parameterise the dates, log errors, and schedule it with Windows Task Scheduler/cron or Airflow. Keep the code in Git.",
      "level": "Hard"
    },
    {
      "q": "Explain the difference between loc and iloc, merge and concat, and apply and vectorization in one minute.",
      "a": "loc selects by labels (inclusive slices), iloc by positions (exclusive). merge joins tables on keys like SQL JOIN; concat stacks tables along an axis. apply runs a Python function per element/row (flexible, slow); vectorized operations work on whole columns in C (fast) and should be preferred.",
      "level": "Medium"
    },
    {
      "q": "What should a good analyst portfolio project include?",
      "a": "A real business question, a realistic multi-table or messy dataset, documented cleaning, clear KPIs, 4-6 meaningful charts, an executive summary with actionable insights, a deliverable (Excel report/dashboard), clean code in notebooks or scripts, and a README with screenshots and how to run it - hosted on GitHub.",
      "level": "Easy"
    }
  ],
  "practice": [
    {
      "task": "Using the capstone data, compute profit and margin % for each store and rank the stores by margin.",
      "hint": "groupby('city').agg(revenue=..., profit=...), margin = profit / revenue * 100, rank(ascending=False)",
      "solution": "# Start with the capstone data + merge code from Step 1 (creates df)\nst = df.groupby(\"city\").agg(revenue=(\"revenue\", \"sum\"), profit=(\"profit\", \"sum\"))\nst[\"margin_pct\"] = (st[\"profit\"] / st[\"revenue\"] * 100).round(2)\nst[\"rank\"] = st[\"margin_pct\"].rank(ascending=False).astype(int)\nprint(st.sort_values(\"rank\"))\n"
    },
    {
      "task": "Find the month with the highest profit in each region and its profit value.",
      "hint": "groupby(['region', 'month'])['profit'].sum(), then groupby(level=0).idxmax() or sort + drop_duplicates.",
      "solution": "# Start with the capstone data + merge code from Step 1 (creates df)\nrm = df.groupby([\"region\", \"month\"], as_index=False)[\"profit\"].sum()\nbest = rm.sort_values(\"profit\", ascending=False).drop_duplicates(\"region\")\nprint(best.sort_values(\"region\").to_string(index=False))\n"
    },
    {
      "task": "Export a Category x Month revenue pivot table to Excel with a bold header, frozen first row and '#,##0' number format on all values (run locally with openpyxl).",
      "hint": "pivot.to_excel(writer, sheet_name='Pivot'); then loop over ws.iter_rows(min_row=2, min_col=2).",
      "solution": "# Start with the capstone data + merge code from Step 1 (creates df)\nfrom openpyxl.styles import Font\n\npivot = df.pivot_table(index=\"category\", columns=\"month\", values=\"revenue\", aggfunc=\"sum\")\nwith pd.ExcelWriter(\"category_month.xlsx\", engine=\"openpyxl\") as writer:\n    pivot.to_excel(writer, sheet_name=\"Pivot\")\n    ws = writer.sheets[\"Pivot\"]\n    ws.freeze_panes = \"B2\"\n    for cell in ws[1]:\n        cell.font = Font(bold=True)\n    for row in ws.iter_rows(min_row=2, min_col=2):\n        for cell in row:\n            cell.number_format = \"#,##0\"\nprint(pd.read_excel(\"category_month.xlsx\", index_col=0).shape)\n"
    },
    {
      "task": "Interview drill: given an orders DataFrame (customer, order_date, amount), find customers who ordered in BOTH January and February, and each customer's first order date.",
      "hint": "Use a set intersection of customers per month, and groupby('customer')['order_date'].min().",
      "solution": "import pandas as pd\n\no = pd.DataFrame({\n    \"customer\": [\"A\", \"B\", \"A\", \"C\", \"B\", \"D\"],\n    \"order_date\": pd.to_datetime([\"2024-01-05\", \"2024-01-09\", \"2024-02-11\",\n                                  \"2024-02-14\", \"2024-02-20\", \"2024-01-30\"]),\n    \"amount\": [500, 700, 300, 900, 450, 120],\n})\njan = set(o.loc[o[\"order_date\"].dt.month == 1, \"customer\"])\nfeb = set(o.loc[o[\"order_date\"].dt.month == 2, \"customer\"])\nprint(\"Both months:\", sorted(jan & feb))\nprint(o.groupby(\"customer\")[\"order_date\"].min())\n"
    },
    {
      "task": "Write your own 2-minute STAR pitch for the capstone in a Python multi-line string and print it. Include at least three numbers produced by your analysis.",
      "hint": "Situation, Task, Action, Result - use f-strings to insert computed KPIs.",
      "solution": "# Start with the capstone data + merge code from Step 1 (creates df)\nrev = df[\"revenue\"].sum()\nmargin = df[\"profit\"].sum() / rev\nbest_cat = df.groupby(\"category\")[\"profit\"].sum().idxmax()\npitch = f'''Situation: A 5-store grocery chain wanted an H1 2024 performance review.\nTask: Measure revenue, profit and target achievement, and find growth levers.\nAction: Merged 3 tables in pandas, validated joins, built KPIs with groupby and pivot\ntables, created charts and a formatted Excel report.\nResult: Revenue Rs {rev / 1e5:.1f} lakh at {margin:.1%} margin; {best_cat} is the top\nprofit category; identified the stores below target with the gap to close.'''\nprint(pitch)\n"
    }
  ],
  "quiz": [
    {
      "question": "Which object writes several DataFrames to different sheets of one Excel file?",
      "options": [
        "pd.ExcelFile",
        "pd.ExcelWriter",
        "df.to_sheets",
        "openpyxl.Workbook only"
      ],
      "answer": 1,
      "explanation": "pd.ExcelWriter keeps the workbook open so each to_excel call can target a new sheet."
    },
    {
      "question": "Margin % is calculated as:",
      "options": [
        "Revenue / profit x 100",
        "Profit / revenue x 100",
        "Cost / revenue x 100",
        "Profit / cost x 100"
      ],
      "answer": 1,
      "explanation": "Margin = profit divided by revenue."
    },
    {
      "question": "Which Excel number format shows 0.153 as 15.3%?",
      "options": [
        "'#,##0'",
        "'0.0%'",
        "'0.00'",
        "'@'"
      ],
      "answer": 1,
      "explanation": "'0.0%' multiplies by 100 and adds a percent sign with one decimal."
    },
    {
      "question": "Best pandas pattern for 'top 2 salaries in each department' including ties:",
      "options": [
        "df.nlargest(2, 'salary')",
        "groupby rank(method='dense') <= 2",
        "df.head(2)",
        "df.sort_values('dept').tail(2)"
      ],
      "answer": 1,
      "explanation": "A dense rank within each group keeps tied values."
    },
    {
      "question": "What does validate='many_to_one' in merge protect against?",
      "options": [
        "Missing values",
        "Duplicate keys in the right table causing extra rows",
        "Wrong column names",
        "Slow performance"
      ],
      "answer": 1,
      "explanation": "It raises MergeError if right-side keys are not unique."
    },
    {
      "question": "STAR in interview answers stands for:",
      "options": [
        "Statistics, Tables, Analysis, Reports",
        "Situation, Task, Action, Result",
        "SQL, Tableau, Apps, R",
        "Start, Test, Analyse, Repeat"
      ],
      "answer": 1,
      "explanation": "STAR structures a project story clearly."
    }
  ]
};
