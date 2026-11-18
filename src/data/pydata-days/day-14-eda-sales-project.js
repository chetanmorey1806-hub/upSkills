export default {
  "id": "day-14-eda-sales-project",
  "title": "Exploratory Data Analysis (EDA) End-to-End on a Sales Dataset",
  "module": "Module 4: Projects",
  "day": 14,
  "level": "Advanced",
  "duration": "4 hours",
  "summary": "Apply everything from NumPy, pandas and visualization to a complete exploratory data analysis of one year of e-commerce sales: define questions, profile and clean the data, build KPIs, run univariate, bivariate and time-based analysis, segment customers and products, visualise findings and turn them into business insights and recommendations.",
  "objectives": [
    "Follow a structured EDA process from business questions to insights",
    "Profile a dataset and document data-quality issues before cleaning",
    "Calculate business KPIs: revenue, orders, AOV, return rate, discount impact",
    "Perform univariate, bivariate, time-series and segment (Pareto/ABC) analysis",
    "Build a summary chart dashboard and write clear, evidence-based insights"
  ],
  "theory": [
    {
      "heading": "What is EDA?",
      "content": "Exploratory Data Analysis (EDA) is the first deep look at a dataset to understand its structure, quality, patterns, relationships and anomalies **before** building reports or models. The term was popularised by statistician John Tukey. In analyst jobs, EDA is usually the bulk of a project and the main topic of take-home assignments and case-study interviews.\n\nEDA answers: What do we have? Can we trust it? What is normal? What stands out? What drives the key metric?"
    },
    {
      "heading": "A Repeatable EDA Framework",
      "content": "Use the same structure every time - it also makes a great answer to 'How do you approach a new dataset?'",
      "points": [
        "1. **Define questions & KPIs** with stakeholders (e.g. Which categories/cities drive revenue? Is there seasonality? Do discounts help?)",
        "2. **Profile** - shape, dtypes, head, describe, missing %, duplicates, unique values, date range",
        "3. **Clean** - fix types, text, duplicates, invalid values, missing values; record every decision",
        "4. **Univariate analysis** - distribution of each important column (histograms, value_counts)",
        "5. **Bivariate / multivariate** - metric by category, correlation, pivot tables, cross-tabs",
        "6. **Time analysis** - trend, seasonality, MoM growth, weekday patterns",
        "7. **Segmentation** - Pareto (80/20), ABC classes, top-N, cohorts",
        "8. **Visualise & communicate** - 4-6 key charts and 3-5 insights with recommended actions"
      ]
    },
    {
      "heading": "Business KPIs for Sales Data",
      "content": "Define each KPI precisely - interviewers check whether you know the formulas.",
      "points": [
        "**Revenue** (net sales) = qty x unit_price x (1 - discount) for delivered orders",
        "**Orders** = number of distinct order_ids",
        "**AOV (Average Order Value)** = revenue / orders",
        "**Return rate** = returned orders / total orders",
        "**Cancellation rate** = cancelled orders / total orders",
        "**Units per order** = total qty / orders",
        "**MoM growth %** = (this month - last month) / last month x 100",
        "**Revenue share %** of a category/city = its revenue / total revenue x 100"
      ],
      "tip": "Always state which orders are included (delivered only? excluding cancelled?) - two analysts can report different 'revenue' from the same data if definitions differ."
    },
    {
      "heading": "Univariate and Bivariate Analysis",
      "content": "**Univariate** analysis looks at one variable at a time: numeric columns with describe(), skewness, histograms and box plots; categorical columns with value_counts(normalize=True) and bar charts.\n\n**Bivariate** analysis looks at two variables together: numeric vs category (groupby mean/sum, box plot by group), category vs category (crosstab, stacked bars), numeric vs numeric (corr, scatter). This is where you find drivers: e.g. higher discount -> more units but lower price per unit.",
      "syntax": "df['revenue'].describe(); df['revenue'].skew()\ndf['category'].value_counts(normalize=True)\ndf.groupby('category')['revenue'].agg(['sum', 'mean', 'count'])\npd.crosstab(df['category'], df['status'], normalize='index')\ndf[['qty', 'unit_price', 'discount_pct', 'revenue']].corr()"
    },
    {
      "heading": "Pareto (80/20) and ABC Analysis",
      "content": "In most businesses a small share of products or customers generates most of the revenue. Sort items by revenue, compute the cumulative share and classify: **A** = items making the first ~80% of revenue, **B** = next ~15%, **C** = last ~5%. A-items deserve the best stock availability and marketing focus.",
      "syntax": "prod = df.groupby('product')['revenue'].sum().sort_values(ascending=False)\ncum_share = prod.cumsum() / prod.sum()\nabc = pd.cut(cum_share, bins=[0, 0.8, 0.95, 1.0], labels=['A', 'B', 'C'])"
    },
    {
      "heading": "Turning Findings into Insights",
      "content": "An observation is not an insight. Use the pattern **What -> So what -> Now what**: state the fact with a number, explain why it matters, and recommend an action.",
      "points": [
        "Weak: 'Electronics has high revenue.'",
        "Strong: 'Electronics brings about two-thirds of revenue from only about 22% of orders (What); a stock-out or price war in this category would hit the business hard (So what); secure supplier stock before October-November festive season and track its margin weekly (Now what).'",
        "Support each insight with one chart and one table",
        "Mention data limitations (missing prices imputed, one year only, no cost data so no profit analysis)"
      ],
      "tip": "A good EDA notebook ends with an 'Executive Summary' cell of 3-5 bullet points that a manager can read in 30 seconds."
    }
  ],
  "examples": [
    {
      "title": "Step 1 - Profile the Raw Data",
      "scenario": "You receive one year of order data (1,215 rows). Before changing anything, profile it and list the data-quality issues.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it (each step re-creates the same seeded dataset, so steps run independently)",
        "Compare your output with the result below"
      ],
      "code": "import numpy as np\nimport pandas as pd\n\n# ---- Create a realistic (and slightly messy) e-commerce sales dataset ----\nrng = np.random.default_rng(2024)\nn = 1200\ncats = {\"Electronics\": 12000, \"Fashion\": 1500, \"Home\": 3000, \"Beauty\": 800, \"Books\": 450}\nraw = pd.DataFrame({\n    \"order_id\": np.arange(10001, 10001 + n),\n    \"order_date\": pd.Timestamp(\"2024-01-01\") + pd.to_timedelta(rng.integers(0, 366, n), unit=\"D\"),\n    \"city\": rng.choice([\"Mumbai\", \"Delhi\", \"Bengaluru\", \"Pune\", \"Chennai\", \"mumbai \"], n,\n                       p=[0.24, 0.22, 0.2, 0.14, 0.12, 0.08]),\n    \"category\": rng.choice(list(cats), n, p=[0.2, 0.3, 0.2, 0.18, 0.12]),\n    \"channel\": rng.choice([\"App\", \"Web\"], n, p=[0.65, 0.35]),\n    \"qty\": rng.integers(1, 5, n),\n    \"discount_pct\": rng.choice([0, 5, 10, 20, 30], n, p=[0.3, 0.2, 0.25, 0.15, 0.1]),\n})\nraw[\"unit_price\"] = (raw[\"category\"].map(cats) * rng.lognormal(0, 0.3, n)).round(-1)\nfestive = raw[\"order_date\"].dt.month.isin([10, 11])\nraw.loc[festive, \"qty\"] += 1\nraw[\"status\"] = rng.choice([\"Delivered\", \"Returned\", \"Cancelled\"], n, p=[0.86, 0.09, 0.05])\nraw.loc[rng.choice(n, 25, replace=False), \"unit_price\"] = np.nan\nraw.loc[rng.choice(n, 3, replace=False), \"qty\"] = -1\nraw = pd.concat([raw, raw.sample(15, random_state=1)], ignore_index=True)\n\nprint(\"Shape:\", raw.shape)\nprint(raw.dtypes)\nprint(\"Date range:\", raw[\"order_date\"].min().date(), \"to\", raw[\"order_date\"].max().date())\nprint(\"Missing values:\")\nprint(raw.isna().sum()[raw.isna().sum() > 0])\nprint(\"Exact duplicate rows:\", raw.duplicated().sum())\nprint(\"Invalid qty (<= 0):\", (raw[\"qty\"] <= 0).sum())\nprint(\"City values:\", sorted(raw[\"city\"].unique()))\nprint(raw[\"status\"].value_counts())\n",
      "python": {
        "files": {
          "main.py": "import numpy as np\nimport pandas as pd\n\n# ---- Create a realistic (and slightly messy) e-commerce sales dataset ----\nrng = np.random.default_rng(2024)\nn = 1200\ncats = {\"Electronics\": 12000, \"Fashion\": 1500, \"Home\": 3000, \"Beauty\": 800, \"Books\": 450}\nraw = pd.DataFrame({\n    \"order_id\": np.arange(10001, 10001 + n),\n    \"order_date\": pd.Timestamp(\"2024-01-01\") + pd.to_timedelta(rng.integers(0, 366, n), unit=\"D\"),\n    \"city\": rng.choice([\"Mumbai\", \"Delhi\", \"Bengaluru\", \"Pune\", \"Chennai\", \"mumbai \"], n,\n                       p=[0.24, 0.22, 0.2, 0.14, 0.12, 0.08]),\n    \"category\": rng.choice(list(cats), n, p=[0.2, 0.3, 0.2, 0.18, 0.12]),\n    \"channel\": rng.choice([\"App\", \"Web\"], n, p=[0.65, 0.35]),\n    \"qty\": rng.integers(1, 5, n),\n    \"discount_pct\": rng.choice([0, 5, 10, 20, 30], n, p=[0.3, 0.2, 0.25, 0.15, 0.1]),\n})\nraw[\"unit_price\"] = (raw[\"category\"].map(cats) * rng.lognormal(0, 0.3, n)).round(-1)\nfestive = raw[\"order_date\"].dt.month.isin([10, 11])\nraw.loc[festive, \"qty\"] += 1\nraw[\"status\"] = rng.choice([\"Delivered\", \"Returned\", \"Cancelled\"], n, p=[0.86, 0.09, 0.05])\nraw.loc[rng.choice(n, 25, replace=False), \"unit_price\"] = np.nan\nraw.loc[rng.choice(n, 3, replace=False), \"qty\"] = -1\nraw = pd.concat([raw, raw.sample(15, random_state=1)], ignore_index=True)\n\nprint(\"Shape:\", raw.shape)\nprint(raw.dtypes)\nprint(\"Date range:\", raw[\"order_date\"].min().date(), \"to\", raw[\"order_date\"].max().date())\nprint(\"Missing values:\")\nprint(raw.isna().sum()[raw.isna().sum() > 0])\nprint(\"Exact duplicate rows:\", raw.duplicated().sum())\nprint(\"Invalid qty (<= 0):\", (raw[\"qty\"] <= 0).sum())\nprint(\"City values:\", sorted(raw[\"city\"].unique()))\nprint(raw[\"status\"].value_counts())\n"
        }
      },
      "result": "Shape: (1215, 9)\norder_id                 int64\norder_date      datetime64[ns]\ncity                    object\ncategory                object\nchannel                 object\nqty                      int64\ndiscount_pct             int64\nunit_price             float64\nstatus                  object\ndtype: object\nDate range: 2024-01-01 to 2024-12-30\nMissing values:\nunit_price    26\ndtype: int64\nExact duplicate rows: 15\nInvalid qty (<= 0): 3\nCity values: ['Bengaluru', 'Chennai', 'Delhi', 'Mumbai', 'Pune', 'mumbai ']\nstatus\nDelivered    1044\nReturned      117\nCancelled      54\nName: count, dtype: int64",
      "explanation": "Profiling reveals four issues to fix: 26 missing unit prices (one of them inside a duplicated row), 15 exact duplicate rows, 3 rows with a negative quantity, and 'mumbai ' written inconsistently next to 'Mumbai'. dtypes look correct (order_date is already datetime). Write these findings down - they go into the 'Data Quality' section of your report."
    },
    {
      "title": "Step 2 - Clean the Data and Build KPIs",
      "scenario": "Fix the issues found in Step 1, compute revenue, and calculate headline KPIs for the year.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it (each step re-creates the same seeded dataset, so steps run independently)",
        "Compare your output with the result below"
      ],
      "code": "import numpy as np\nimport pandas as pd\n\n# ---- Create a realistic (and slightly messy) e-commerce sales dataset ----\nrng = np.random.default_rng(2024)\nn = 1200\ncats = {\"Electronics\": 12000, \"Fashion\": 1500, \"Home\": 3000, \"Beauty\": 800, \"Books\": 450}\nraw = pd.DataFrame({\n    \"order_id\": np.arange(10001, 10001 + n),\n    \"order_date\": pd.Timestamp(\"2024-01-01\") + pd.to_timedelta(rng.integers(0, 366, n), unit=\"D\"),\n    \"city\": rng.choice([\"Mumbai\", \"Delhi\", \"Bengaluru\", \"Pune\", \"Chennai\", \"mumbai \"], n,\n                       p=[0.24, 0.22, 0.2, 0.14, 0.12, 0.08]),\n    \"category\": rng.choice(list(cats), n, p=[0.2, 0.3, 0.2, 0.18, 0.12]),\n    \"channel\": rng.choice([\"App\", \"Web\"], n, p=[0.65, 0.35]),\n    \"qty\": rng.integers(1, 5, n),\n    \"discount_pct\": rng.choice([0, 5, 10, 20, 30], n, p=[0.3, 0.2, 0.25, 0.15, 0.1]),\n})\nraw[\"unit_price\"] = (raw[\"category\"].map(cats) * rng.lognormal(0, 0.3, n)).round(-1)\nfestive = raw[\"order_date\"].dt.month.isin([10, 11])\nraw.loc[festive, \"qty\"] += 1\nraw[\"status\"] = rng.choice([\"Delivered\", \"Returned\", \"Cancelled\"], n, p=[0.86, 0.09, 0.05])\nraw.loc[rng.choice(n, 25, replace=False), \"unit_price\"] = np.nan\nraw.loc[rng.choice(n, 3, replace=False), \"qty\"] = -1\nraw = pd.concat([raw, raw.sample(15, random_state=1)], ignore_index=True)\n\ndf = raw.drop_duplicates().copy()\ndf[\"city\"] = df[\"city\"].str.strip().str.title()\ndf = df[df[\"qty\"] > 0]\ndf[\"unit_price\"] = df[\"unit_price\"].fillna(df.groupby(\"category\")[\"unit_price\"].transform(\"median\"))\ndf[\"revenue\"] = df[\"qty\"] * df[\"unit_price\"] * (1 - df[\"discount_pct\"] / 100)\nprint(\"Rows after cleaning:\", len(df), \"| missing:\", df.isna().sum().sum())\n\nsales = df[df[\"status\"] == \"Delivered\"]\nrevenue = sales[\"revenue\"].sum()\norders = sales[\"order_id\"].nunique()\nprint(f\"Net revenue: Rs {revenue / 1e5:,.1f} lakh\")\nprint(\"Delivered orders:\", orders)\nprint(f\"AOV: Rs {revenue / orders:,.0f}\")\nprint(f\"Return rate: {(df['status'] == 'Returned').mean():.1%}\")\nprint(f\"Cancellation rate: {(df['status'] == 'Cancelled').mean():.1%}\")\nprint(f\"Units per order: {sales['qty'].sum() / orders:.2f}\")\n",
      "python": {
        "files": {
          "main.py": "import numpy as np\nimport pandas as pd\n\n# ---- Create a realistic (and slightly messy) e-commerce sales dataset ----\nrng = np.random.default_rng(2024)\nn = 1200\ncats = {\"Electronics\": 12000, \"Fashion\": 1500, \"Home\": 3000, \"Beauty\": 800, \"Books\": 450}\nraw = pd.DataFrame({\n    \"order_id\": np.arange(10001, 10001 + n),\n    \"order_date\": pd.Timestamp(\"2024-01-01\") + pd.to_timedelta(rng.integers(0, 366, n), unit=\"D\"),\n    \"city\": rng.choice([\"Mumbai\", \"Delhi\", \"Bengaluru\", \"Pune\", \"Chennai\", \"mumbai \"], n,\n                       p=[0.24, 0.22, 0.2, 0.14, 0.12, 0.08]),\n    \"category\": rng.choice(list(cats), n, p=[0.2, 0.3, 0.2, 0.18, 0.12]),\n    \"channel\": rng.choice([\"App\", \"Web\"], n, p=[0.65, 0.35]),\n    \"qty\": rng.integers(1, 5, n),\n    \"discount_pct\": rng.choice([0, 5, 10, 20, 30], n, p=[0.3, 0.2, 0.25, 0.15, 0.1]),\n})\nraw[\"unit_price\"] = (raw[\"category\"].map(cats) * rng.lognormal(0, 0.3, n)).round(-1)\nfestive = raw[\"order_date\"].dt.month.isin([10, 11])\nraw.loc[festive, \"qty\"] += 1\nraw[\"status\"] = rng.choice([\"Delivered\", \"Returned\", \"Cancelled\"], n, p=[0.86, 0.09, 0.05])\nraw.loc[rng.choice(n, 25, replace=False), \"unit_price\"] = np.nan\nraw.loc[rng.choice(n, 3, replace=False), \"qty\"] = -1\nraw = pd.concat([raw, raw.sample(15, random_state=1)], ignore_index=True)\n\ndf = raw.drop_duplicates().copy()\ndf[\"city\"] = df[\"city\"].str.strip().str.title()\ndf = df[df[\"qty\"] > 0]\ndf[\"unit_price\"] = df[\"unit_price\"].fillna(df.groupby(\"category\")[\"unit_price\"].transform(\"median\"))\ndf[\"revenue\"] = df[\"qty\"] * df[\"unit_price\"] * (1 - df[\"discount_pct\"] / 100)\nprint(\"Rows after cleaning:\", len(df), \"| missing:\", df.isna().sum().sum())\n\nsales = df[df[\"status\"] == \"Delivered\"]\nrevenue = sales[\"revenue\"].sum()\norders = sales[\"order_id\"].nunique()\nprint(f\"Net revenue: Rs {revenue / 1e5:,.1f} lakh\")\nprint(\"Delivered orders:\", orders)\nprint(f\"AOV: Rs {revenue / orders:,.0f}\")\nprint(f\"Return rate: {(df['status'] == 'Returned').mean():.1%}\")\nprint(f\"Cancellation rate: {(df['status'] == 'Cancelled').mean():.1%}\")\nprint(f\"Units per order: {sales['qty'].sum() / orders:.2f}\")\n"
        }
      },
      "result": "Rows after cleaning: 1197 | missing: 0\nNet revenue: Rs 101.2 lakh\nDelivered orders: 1027\nAOV: Rs 9,852\nReturn rate: 9.8%\nCancellation rate: 4.4%\nUnits per order: 2.72",
      "explanation": "Duplicates are removed first, then city names are standardised, invalid quantities dropped and missing prices filled with the category median (not the overall median, since an Electronics item and a Book have very different prices). Revenue is defined as net of discount and only for delivered orders. These KPIs form the top row of any sales dashboard."
    },
    {
      "title": "Step 3 - Univariate and Category/City Analysis",
      "scenario": "Which categories and cities drive revenue? How are order values distributed? Compare share of orders with share of revenue.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it (each step re-creates the same seeded dataset, so steps run independently)",
        "Compare your output with the result below"
      ],
      "code": "import numpy as np\nimport pandas as pd\n\n# ---- Create a realistic (and slightly messy) e-commerce sales dataset ----\nrng = np.random.default_rng(2024)\nn = 1200\ncats = {\"Electronics\": 12000, \"Fashion\": 1500, \"Home\": 3000, \"Beauty\": 800, \"Books\": 450}\nraw = pd.DataFrame({\n    \"order_id\": np.arange(10001, 10001 + n),\n    \"order_date\": pd.Timestamp(\"2024-01-01\") + pd.to_timedelta(rng.integers(0, 366, n), unit=\"D\"),\n    \"city\": rng.choice([\"Mumbai\", \"Delhi\", \"Bengaluru\", \"Pune\", \"Chennai\", \"mumbai \"], n,\n                       p=[0.24, 0.22, 0.2, 0.14, 0.12, 0.08]),\n    \"category\": rng.choice(list(cats), n, p=[0.2, 0.3, 0.2, 0.18, 0.12]),\n    \"channel\": rng.choice([\"App\", \"Web\"], n, p=[0.65, 0.35]),\n    \"qty\": rng.integers(1, 5, n),\n    \"discount_pct\": rng.choice([0, 5, 10, 20, 30], n, p=[0.3, 0.2, 0.25, 0.15, 0.1]),\n})\nraw[\"unit_price\"] = (raw[\"category\"].map(cats) * rng.lognormal(0, 0.3, n)).round(-1)\nfestive = raw[\"order_date\"].dt.month.isin([10, 11])\nraw.loc[festive, \"qty\"] += 1\nraw[\"status\"] = rng.choice([\"Delivered\", \"Returned\", \"Cancelled\"], n, p=[0.86, 0.09, 0.05])\nraw.loc[rng.choice(n, 25, replace=False), \"unit_price\"] = np.nan\nraw.loc[rng.choice(n, 3, replace=False), \"qty\"] = -1\nraw = pd.concat([raw, raw.sample(15, random_state=1)], ignore_index=True)\n\n# ---- Cleaning (from Step 2) ----\ndf = raw.drop_duplicates().copy()\ndf[\"city\"] = df[\"city\"].str.strip().str.title()\ndf = df[df[\"qty\"] > 0]\ndf[\"unit_price\"] = df[\"unit_price\"].fillna(df.groupby(\"category\")[\"unit_price\"].transform(\"median\"))\ndf[\"revenue\"] = df[\"qty\"] * df[\"unit_price\"] * (1 - df[\"discount_pct\"] / 100)\ndf[\"month\"] = df[\"order_date\"].dt.to_period(\"M\")\nsales = df[df[\"status\"] == \"Delivered\"].copy()\n\nprint(\"Order value: median\", round(sales[\"revenue\"].median()), \"| mean\", round(sales[\"revenue\"].mean()),\n      \"| skew\", round(sales[\"revenue\"].skew(), 2))\n\ncat = sales.groupby(\"category\").agg(orders=(\"order_id\", \"count\"), revenue=(\"revenue\", \"sum\"))\ncat[\"order_share\"] = (cat[\"orders\"] / cat[\"orders\"].sum() * 100).round(1)\ncat[\"rev_share\"] = (cat[\"revenue\"] / cat[\"revenue\"].sum() * 100).round(1)\ncat[\"aov\"] = (cat[\"revenue\"] / cat[\"orders\"]).round(0)\nprint(cat.sort_values(\"revenue\", ascending=False)[[\"orders\", \"order_share\", \"rev_share\", \"aov\"]])\n\ncity = sales.groupby(\"city\")[\"revenue\"].sum().sort_values(ascending=False)\nprint((city / 1e5).round(1))\nprint(\"Return rate by category (%):\")\nprint((pd.crosstab(df[\"category\"], df[\"status\"], normalize=\"index\")[\"Returned\"] * 100).round(1))\n",
      "python": {
        "files": {
          "main.py": "import numpy as np\nimport pandas as pd\n\n# ---- Create a realistic (and slightly messy) e-commerce sales dataset ----\nrng = np.random.default_rng(2024)\nn = 1200\ncats = {\"Electronics\": 12000, \"Fashion\": 1500, \"Home\": 3000, \"Beauty\": 800, \"Books\": 450}\nraw = pd.DataFrame({\n    \"order_id\": np.arange(10001, 10001 + n),\n    \"order_date\": pd.Timestamp(\"2024-01-01\") + pd.to_timedelta(rng.integers(0, 366, n), unit=\"D\"),\n    \"city\": rng.choice([\"Mumbai\", \"Delhi\", \"Bengaluru\", \"Pune\", \"Chennai\", \"mumbai \"], n,\n                       p=[0.24, 0.22, 0.2, 0.14, 0.12, 0.08]),\n    \"category\": rng.choice(list(cats), n, p=[0.2, 0.3, 0.2, 0.18, 0.12]),\n    \"channel\": rng.choice([\"App\", \"Web\"], n, p=[0.65, 0.35]),\n    \"qty\": rng.integers(1, 5, n),\n    \"discount_pct\": rng.choice([0, 5, 10, 20, 30], n, p=[0.3, 0.2, 0.25, 0.15, 0.1]),\n})\nraw[\"unit_price\"] = (raw[\"category\"].map(cats) * rng.lognormal(0, 0.3, n)).round(-1)\nfestive = raw[\"order_date\"].dt.month.isin([10, 11])\nraw.loc[festive, \"qty\"] += 1\nraw[\"status\"] = rng.choice([\"Delivered\", \"Returned\", \"Cancelled\"], n, p=[0.86, 0.09, 0.05])\nraw.loc[rng.choice(n, 25, replace=False), \"unit_price\"] = np.nan\nraw.loc[rng.choice(n, 3, replace=False), \"qty\"] = -1\nraw = pd.concat([raw, raw.sample(15, random_state=1)], ignore_index=True)\n\n# ---- Cleaning (from Step 2) ----\ndf = raw.drop_duplicates().copy()\ndf[\"city\"] = df[\"city\"].str.strip().str.title()\ndf = df[df[\"qty\"] > 0]\ndf[\"unit_price\"] = df[\"unit_price\"].fillna(df.groupby(\"category\")[\"unit_price\"].transform(\"median\"))\ndf[\"revenue\"] = df[\"qty\"] * df[\"unit_price\"] * (1 - df[\"discount_pct\"] / 100)\ndf[\"month\"] = df[\"order_date\"].dt.to_period(\"M\")\nsales = df[df[\"status\"] == \"Delivered\"].copy()\n\nprint(\"Order value: median\", round(sales[\"revenue\"].median()), \"| mean\", round(sales[\"revenue\"].mean()),\n      \"| skew\", round(sales[\"revenue\"].skew(), 2))\n\ncat = sales.groupby(\"category\").agg(orders=(\"order_id\", \"count\"), revenue=(\"revenue\", \"sum\"))\ncat[\"order_share\"] = (cat[\"orders\"] / cat[\"orders\"].sum() * 100).round(1)\ncat[\"rev_share\"] = (cat[\"revenue\"] / cat[\"revenue\"].sum() * 100).round(1)\ncat[\"aov\"] = (cat[\"revenue\"] / cat[\"orders\"]).round(0)\nprint(cat.sort_values(\"revenue\", ascending=False)[[\"orders\", \"order_share\", \"rev_share\", \"aov\"]])\n\ncity = sales.groupby(\"city\")[\"revenue\"].sum().sort_values(ascending=False)\nprint((city / 1e5).round(1))\nprint(\"Return rate by category (%):\")\nprint((pd.crosstab(df[\"category\"], df[\"status\"], normalize=\"index\")[\"Returned\"] * 100).round(1))\n"
        }
      },
      "result": "Order value: median 3948 | mean 9852 | skew 2.36\n             orders  order_share  rev_share      aov\ncategory                                            \nElectronics     224         21.8       68.3  30838.0\nHome            205         20.0       15.2   7516.0\nFashion         301         29.3       11.3   3798.0\nBeauty          172         16.7        3.6   2124.0\nBooks           125         12.2        1.6   1287.0\ncity\nMumbai       32.5\nDelhi        22.1\nBengaluru    20.6\nPune         14.2\nChennai      11.7\nName: revenue, dtype: float64\nReturn rate by category (%):\ncategory\nBeauty         11.2\nBooks          10.2\nElectronics     6.7\nFashion         9.1\nHome           12.4\nName: Returned, dtype: float64",
      "explanation": "Order values are strongly right-skewed (mean far above median), so report the median as the 'typical' order. The category table is the key finding: Electronics has about 20% of orders but well over half of revenue because its AOV is many times higher, while Fashion has the most orders but a small revenue share. Cleaning 'mumbai ' mattered: Mumbai is now correctly the top city. Return rates per category come from a crosstab with row percentages."
    },
    {
      "title": "Step 4 - Time Trend, Seasonality and Discount Impact",
      "scenario": "Is there seasonality? What is month-over-month growth? Do bigger discounts lead to bigger orders?",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it (each step re-creates the same seeded dataset, so steps run independently)",
        "Compare your output with the result below"
      ],
      "code": "import numpy as np\nimport pandas as pd\n\n# ---- Create a realistic (and slightly messy) e-commerce sales dataset ----\nrng = np.random.default_rng(2024)\nn = 1200\ncats = {\"Electronics\": 12000, \"Fashion\": 1500, \"Home\": 3000, \"Beauty\": 800, \"Books\": 450}\nraw = pd.DataFrame({\n    \"order_id\": np.arange(10001, 10001 + n),\n    \"order_date\": pd.Timestamp(\"2024-01-01\") + pd.to_timedelta(rng.integers(0, 366, n), unit=\"D\"),\n    \"city\": rng.choice([\"Mumbai\", \"Delhi\", \"Bengaluru\", \"Pune\", \"Chennai\", \"mumbai \"], n,\n                       p=[0.24, 0.22, 0.2, 0.14, 0.12, 0.08]),\n    \"category\": rng.choice(list(cats), n, p=[0.2, 0.3, 0.2, 0.18, 0.12]),\n    \"channel\": rng.choice([\"App\", \"Web\"], n, p=[0.65, 0.35]),\n    \"qty\": rng.integers(1, 5, n),\n    \"discount_pct\": rng.choice([0, 5, 10, 20, 30], n, p=[0.3, 0.2, 0.25, 0.15, 0.1]),\n})\nraw[\"unit_price\"] = (raw[\"category\"].map(cats) * rng.lognormal(0, 0.3, n)).round(-1)\nfestive = raw[\"order_date\"].dt.month.isin([10, 11])\nraw.loc[festive, \"qty\"] += 1\nraw[\"status\"] = rng.choice([\"Delivered\", \"Returned\", \"Cancelled\"], n, p=[0.86, 0.09, 0.05])\nraw.loc[rng.choice(n, 25, replace=False), \"unit_price\"] = np.nan\nraw.loc[rng.choice(n, 3, replace=False), \"qty\"] = -1\nraw = pd.concat([raw, raw.sample(15, random_state=1)], ignore_index=True)\n\n# ---- Cleaning (from Step 2) ----\ndf = raw.drop_duplicates().copy()\ndf[\"city\"] = df[\"city\"].str.strip().str.title()\ndf = df[df[\"qty\"] > 0]\ndf[\"unit_price\"] = df[\"unit_price\"].fillna(df.groupby(\"category\")[\"unit_price\"].transform(\"median\"))\ndf[\"revenue\"] = df[\"qty\"] * df[\"unit_price\"] * (1 - df[\"discount_pct\"] / 100)\ndf[\"month\"] = df[\"order_date\"].dt.to_period(\"M\")\nsales = df[df[\"status\"] == \"Delivered\"].copy()\n\nmonthly = sales.groupby(\"month\")[\"revenue\"].sum()\ntrend = pd.DataFrame({\"rev_lakh\": (monthly / 1e5).round(1),\n                      \"mom_pct\": (monthly.pct_change() * 100).round(1)})\nprint(trend)\nprint(\"Best month:\", monthly.idxmax(), \"| Worst month:\", monthly.idxmin())\nfestive = sales[\"order_date\"].dt.month.isin([10, 11])\nprint(f\"Festive (Oct-Nov) share of revenue: {sales.loc[festive, 'revenue'].sum() / sales['revenue'].sum():.1%}\")\n\nweekday = sales.groupby(sales[\"order_date\"].dt.day_name())[\"revenue\"].mean().round(0)\nprint(\"Highest avg order weekday:\", weekday.idxmax())\n\ndisc = sales.groupby(\"discount_pct\").agg(orders=(\"order_id\", \"count\"),\n                                          avg_qty=(\"qty\", \"mean\"),\n                                          avg_rev=(\"revenue\", \"mean\")).round(2)\nprint(disc)\nprint(\"Corr discount vs qty:\", round(sales[\"discount_pct\"].corr(sales[\"qty\"]), 3))\n",
      "python": {
        "files": {
          "main.py": "import numpy as np\nimport pandas as pd\n\n# ---- Create a realistic (and slightly messy) e-commerce sales dataset ----\nrng = np.random.default_rng(2024)\nn = 1200\ncats = {\"Electronics\": 12000, \"Fashion\": 1500, \"Home\": 3000, \"Beauty\": 800, \"Books\": 450}\nraw = pd.DataFrame({\n    \"order_id\": np.arange(10001, 10001 + n),\n    \"order_date\": pd.Timestamp(\"2024-01-01\") + pd.to_timedelta(rng.integers(0, 366, n), unit=\"D\"),\n    \"city\": rng.choice([\"Mumbai\", \"Delhi\", \"Bengaluru\", \"Pune\", \"Chennai\", \"mumbai \"], n,\n                       p=[0.24, 0.22, 0.2, 0.14, 0.12, 0.08]),\n    \"category\": rng.choice(list(cats), n, p=[0.2, 0.3, 0.2, 0.18, 0.12]),\n    \"channel\": rng.choice([\"App\", \"Web\"], n, p=[0.65, 0.35]),\n    \"qty\": rng.integers(1, 5, n),\n    \"discount_pct\": rng.choice([0, 5, 10, 20, 30], n, p=[0.3, 0.2, 0.25, 0.15, 0.1]),\n})\nraw[\"unit_price\"] = (raw[\"category\"].map(cats) * rng.lognormal(0, 0.3, n)).round(-1)\nfestive = raw[\"order_date\"].dt.month.isin([10, 11])\nraw.loc[festive, \"qty\"] += 1\nraw[\"status\"] = rng.choice([\"Delivered\", \"Returned\", \"Cancelled\"], n, p=[0.86, 0.09, 0.05])\nraw.loc[rng.choice(n, 25, replace=False), \"unit_price\"] = np.nan\nraw.loc[rng.choice(n, 3, replace=False), \"qty\"] = -1\nraw = pd.concat([raw, raw.sample(15, random_state=1)], ignore_index=True)\n\n# ---- Cleaning (from Step 2) ----\ndf = raw.drop_duplicates().copy()\ndf[\"city\"] = df[\"city\"].str.strip().str.title()\ndf = df[df[\"qty\"] > 0]\ndf[\"unit_price\"] = df[\"unit_price\"].fillna(df.groupby(\"category\")[\"unit_price\"].transform(\"median\"))\ndf[\"revenue\"] = df[\"qty\"] * df[\"unit_price\"] * (1 - df[\"discount_pct\"] / 100)\ndf[\"month\"] = df[\"order_date\"].dt.to_period(\"M\")\nsales = df[df[\"status\"] == \"Delivered\"].copy()\n\nmonthly = sales.groupby(\"month\")[\"revenue\"].sum()\ntrend = pd.DataFrame({\"rev_lakh\": (monthly / 1e5).round(1),\n                      \"mom_pct\": (monthly.pct_change() * 100).round(1)})\nprint(trend)\nprint(\"Best month:\", monthly.idxmax(), \"| Worst month:\", monthly.idxmin())\nfestive = sales[\"order_date\"].dt.month.isin([10, 11])\nprint(f\"Festive (Oct-Nov) share of revenue: {sales.loc[festive, 'revenue'].sum() / sales['revenue'].sum():.1%}\")\n\nweekday = sales.groupby(sales[\"order_date\"].dt.day_name())[\"revenue\"].mean().round(0)\nprint(\"Highest avg order weekday:\", weekday.idxmax())\n\ndisc = sales.groupby(\"discount_pct\").agg(orders=(\"order_id\", \"count\"),\n                                          avg_qty=(\"qty\", \"mean\"),\n                                          avg_rev=(\"revenue\", \"mean\")).round(2)\nprint(disc)\nprint(\"Corr discount vs qty:\", round(sales[\"discount_pct\"].corr(sales[\"qty\"]), 3))\n"
        }
      },
      "result": "         rev_lakh  mom_pct\nmonth                     \n2024-01       6.9      NaN\n2024-02       7.9     14.5\n2024-03       9.1     14.5\n2024-04       8.6     -5.4\n2024-05       6.7    -22.1\n2024-06       5.5    -17.7\n2024-07       8.7     57.6\n2024-08       8.4     -3.1\n2024-09       6.4    -24.3\n2024-10      11.0     72.7\n2024-11      12.5     13.4\n2024-12       9.6    -23.4\nBest month: 2024-11 | Worst month: 2024-06\nFestive (Oct-Nov) share of revenue: 23.2%\nHighest avg order weekday: Saturday\n              orders  avg_qty   avg_rev\ndiscount_pct                           \n0                322     2.71  10896.85\n5                215     2.81  10765.13\n10               266     2.68   9126.32\n20               132     2.59   7933.91\n30                92     2.85   8907.20\nCorr discount vs qty: 0.0",
      "explanation": "Monthly revenue with pct_change shows the trend and MoM growth; October and November stand out as the festive peak and together bring a much larger share of revenue than 2 months out of 12 (16.7%) would suggest. The discount table shows average quantity barely changes with discount (correlation close to 0) - discounts here reduce revenue per order without increasing units, which is a valuable, actionable finding."
    },
    {
      "title": "Step 5 - Pareto/ABC Analysis and a Summary Dashboard",
      "scenario": "Classify city-category combinations into A/B/C classes, save a 4-chart dashboard and print an executive summary.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with pandas installed)",
        "Paste the code into main.py and run it (each step re-creates the same seeded dataset, so steps run independently)",
        "Compare your output with the result below"
      ],
      "code": "import numpy as np\nimport pandas as pd\n\n# ---- Create a realistic (and slightly messy) e-commerce sales dataset ----\nrng = np.random.default_rng(2024)\nn = 1200\ncats = {\"Electronics\": 12000, \"Fashion\": 1500, \"Home\": 3000, \"Beauty\": 800, \"Books\": 450}\nraw = pd.DataFrame({\n    \"order_id\": np.arange(10001, 10001 + n),\n    \"order_date\": pd.Timestamp(\"2024-01-01\") + pd.to_timedelta(rng.integers(0, 366, n), unit=\"D\"),\n    \"city\": rng.choice([\"Mumbai\", \"Delhi\", \"Bengaluru\", \"Pune\", \"Chennai\", \"mumbai \"], n,\n                       p=[0.24, 0.22, 0.2, 0.14, 0.12, 0.08]),\n    \"category\": rng.choice(list(cats), n, p=[0.2, 0.3, 0.2, 0.18, 0.12]),\n    \"channel\": rng.choice([\"App\", \"Web\"], n, p=[0.65, 0.35]),\n    \"qty\": rng.integers(1, 5, n),\n    \"discount_pct\": rng.choice([0, 5, 10, 20, 30], n, p=[0.3, 0.2, 0.25, 0.15, 0.1]),\n})\nraw[\"unit_price\"] = (raw[\"category\"].map(cats) * rng.lognormal(0, 0.3, n)).round(-1)\nfestive = raw[\"order_date\"].dt.month.isin([10, 11])\nraw.loc[festive, \"qty\"] += 1\nraw[\"status\"] = rng.choice([\"Delivered\", \"Returned\", \"Cancelled\"], n, p=[0.86, 0.09, 0.05])\nraw.loc[rng.choice(n, 25, replace=False), \"unit_price\"] = np.nan\nraw.loc[rng.choice(n, 3, replace=False), \"qty\"] = -1\nraw = pd.concat([raw, raw.sample(15, random_state=1)], ignore_index=True)\n\n# ---- Cleaning (from Step 2) ----\ndf = raw.drop_duplicates().copy()\ndf[\"city\"] = df[\"city\"].str.strip().str.title()\ndf = df[df[\"qty\"] > 0]\ndf[\"unit_price\"] = df[\"unit_price\"].fillna(df.groupby(\"category\")[\"unit_price\"].transform(\"median\"))\ndf[\"revenue\"] = df[\"qty\"] * df[\"unit_price\"] * (1 - df[\"discount_pct\"] / 100)\ndf[\"month\"] = df[\"order_date\"].dt.to_period(\"M\")\nsales = df[df[\"status\"] == \"Delivered\"].copy()\nimport matplotlib\nmatplotlib.use(\"Agg\")\nimport matplotlib.pyplot as plt\n\nseg = sales.groupby([\"category\", \"city\"])[\"revenue\"].sum().sort_values(ascending=False)\ncum = seg.cumsum() / seg.sum()\nabc = pd.cut(cum, bins=[0, 0.8, 0.95, 1.0], labels=[\"A\", \"B\", \"C\"])\nprint(abc.value_counts().sort_index())\nprint(\"A-class segments:\", len(seg[abc == \"A\"]), \"of\", len(seg))\n\nfig, axes = plt.subplots(2, 2, figsize=(13, 8))\n(sales.groupby(\"month\")[\"revenue\"].sum() / 1e5).plot(ax=axes[0, 0], marker=\"o\", title=\"Monthly Revenue (Rs lakh)\")\n(sales.groupby(\"category\")[\"revenue\"].sum().sort_values() / 1e5).plot(kind=\"barh\", ax=axes[0, 1], title=\"Revenue by Category\")\naxes[1, 0].hist(sales[\"revenue\"], bins=40, color=\"tab:purple\")\naxes[1, 0].set_title(\"Order Value Distribution\")\naxes[1, 1].plot(range(1, len(cum) + 1), cum.values * 100, marker=\".\")\naxes[1, 1].axhline(80, color=\"red\", linestyle=\"--\")\naxes[1, 1].set_title(\"Pareto: Cumulative Revenue % by Segment\")\nfig.tight_layout()\nfig.savefig(\"eda_dashboard.png\", dpi=110)\n\ntop_cat = sales.groupby(\"category\")[\"revenue\"].sum()\nprint(\"EXECUTIVE SUMMARY\")\nprint(f\"1. {top_cat.idxmax()} = {top_cat.max() / top_cat.sum():.0%} of revenue -> protect stock & pricing\")\nprint(f\"2. Peak month {sales.groupby('month')['revenue'].sum().idxmax()} -> plan festive inventory early\")\nprint(f\"3. {len(seg[abc == 'A'])} of {len(seg)} city-category segments make ~80% of revenue -> focus marketing\")\nprint(\"4. Discounts do not raise units per order -> test smaller discounts\")\nprint(\"Saved eda_dashboard.png\")\n",
      "python": {
        "files": {
          "main.py": "import numpy as np\nimport pandas as pd\n\n# ---- Create a realistic (and slightly messy) e-commerce sales dataset ----\nrng = np.random.default_rng(2024)\nn = 1200\ncats = {\"Electronics\": 12000, \"Fashion\": 1500, \"Home\": 3000, \"Beauty\": 800, \"Books\": 450}\nraw = pd.DataFrame({\n    \"order_id\": np.arange(10001, 10001 + n),\n    \"order_date\": pd.Timestamp(\"2024-01-01\") + pd.to_timedelta(rng.integers(0, 366, n), unit=\"D\"),\n    \"city\": rng.choice([\"Mumbai\", \"Delhi\", \"Bengaluru\", \"Pune\", \"Chennai\", \"mumbai \"], n,\n                       p=[0.24, 0.22, 0.2, 0.14, 0.12, 0.08]),\n    \"category\": rng.choice(list(cats), n, p=[0.2, 0.3, 0.2, 0.18, 0.12]),\n    \"channel\": rng.choice([\"App\", \"Web\"], n, p=[0.65, 0.35]),\n    \"qty\": rng.integers(1, 5, n),\n    \"discount_pct\": rng.choice([0, 5, 10, 20, 30], n, p=[0.3, 0.2, 0.25, 0.15, 0.1]),\n})\nraw[\"unit_price\"] = (raw[\"category\"].map(cats) * rng.lognormal(0, 0.3, n)).round(-1)\nfestive = raw[\"order_date\"].dt.month.isin([10, 11])\nraw.loc[festive, \"qty\"] += 1\nraw[\"status\"] = rng.choice([\"Delivered\", \"Returned\", \"Cancelled\"], n, p=[0.86, 0.09, 0.05])\nraw.loc[rng.choice(n, 25, replace=False), \"unit_price\"] = np.nan\nraw.loc[rng.choice(n, 3, replace=False), \"qty\"] = -1\nraw = pd.concat([raw, raw.sample(15, random_state=1)], ignore_index=True)\n\n# ---- Cleaning (from Step 2) ----\ndf = raw.drop_duplicates().copy()\ndf[\"city\"] = df[\"city\"].str.strip().str.title()\ndf = df[df[\"qty\"] > 0]\ndf[\"unit_price\"] = df[\"unit_price\"].fillna(df.groupby(\"category\")[\"unit_price\"].transform(\"median\"))\ndf[\"revenue\"] = df[\"qty\"] * df[\"unit_price\"] * (1 - df[\"discount_pct\"] / 100)\ndf[\"month\"] = df[\"order_date\"].dt.to_period(\"M\")\nsales = df[df[\"status\"] == \"Delivered\"].copy()\nimport matplotlib\nmatplotlib.use(\"Agg\")\nimport matplotlib.pyplot as plt\n\nseg = sales.groupby([\"category\", \"city\"])[\"revenue\"].sum().sort_values(ascending=False)\ncum = seg.cumsum() / seg.sum()\nabc = pd.cut(cum, bins=[0, 0.8, 0.95, 1.0], labels=[\"A\", \"B\", \"C\"])\nprint(abc.value_counts().sort_index())\nprint(\"A-class segments:\", len(seg[abc == \"A\"]), \"of\", len(seg))\n\nfig, axes = plt.subplots(2, 2, figsize=(13, 8))\n(sales.groupby(\"month\")[\"revenue\"].sum() / 1e5).plot(ax=axes[0, 0], marker=\"o\", title=\"Monthly Revenue (Rs lakh)\")\n(sales.groupby(\"category\")[\"revenue\"].sum().sort_values() / 1e5).plot(kind=\"barh\", ax=axes[0, 1], title=\"Revenue by Category\")\naxes[1, 0].hist(sales[\"revenue\"], bins=40, color=\"tab:purple\")\naxes[1, 0].set_title(\"Order Value Distribution\")\naxes[1, 1].plot(range(1, len(cum) + 1), cum.values * 100, marker=\".\")\naxes[1, 1].axhline(80, color=\"red\", linestyle=\"--\")\naxes[1, 1].set_title(\"Pareto: Cumulative Revenue % by Segment\")\nfig.tight_layout()\nfig.savefig(\"eda_dashboard.png\", dpi=110)\n\ntop_cat = sales.groupby(\"category\")[\"revenue\"].sum()\nprint(\"EXECUTIVE SUMMARY\")\nprint(f\"1. {top_cat.idxmax()} = {top_cat.max() / top_cat.sum():.0%} of revenue -> protect stock & pricing\")\nprint(f\"2. Peak month {sales.groupby('month')['revenue'].sum().idxmax()} -> plan festive inventory early\")\nprint(f\"3. {len(seg[abc == 'A'])} of {len(seg)} city-category segments make ~80% of revenue -> focus marketing\")\nprint(\"4. Discounts do not raise units per order -> test smaller discounts\")\nprint(\"Saved eda_dashboard.png\")\n"
        }
      },
      "result": "revenue\nA     7\nB     8\nC    10\nName: count, dtype: int64\nA-class segments: 7 of 25\nEXECUTIVE SUMMARY\n1. Electronics = 68% of revenue -> protect stock & pricing\n2. Peak month 2024-11 -> plan festive inventory early\n3. 7 of 25 city-category segments make ~80% of revenue -> focus marketing\n4. Discounts do not raise units per order -> test smaller discounts\nSaved eda_dashboard.png",
      "explanation": "Sorting segments by revenue and taking the cumulative share gives the Pareto curve; pd.cut on the cumulative share assigns A/B/C classes. A minority of the 25 city-category segments produce 80% of revenue. The 2x2 dashboard collects the four key views (trend, category, distribution, Pareto) and the executive summary turns numbers into 'what -> so what -> now what' statements."
    }
  ],
  "interview": [
    {
      "q": "What is EDA and why is it important?",
      "a": "Exploratory Data Analysis is the process of summarising and visualising a dataset to understand its structure, quality, distributions, relationships and anomalies before reporting or modelling. It prevents wrong conclusions from dirty data, reveals the key drivers of business metrics and guides which deeper analyses to run.",
      "level": "Easy"
    },
    {
      "q": "Walk me through your EDA process for a new sales dataset.",
      "a": "Clarify business questions and KPI definitions; profile (shape, dtypes, missing, duplicates, ranges, unique values); clean and document decisions; univariate analysis of key columns; bivariate analysis (revenue by category/city/channel, correlations); time analysis (trend, seasonality, MoM); segmentation (Pareto/ABC, top-N); visualise 4-6 key charts; summarise 3-5 insights with recommended actions and limitations.",
      "level": "Medium"
    },
    {
      "q": "How do you calculate AOV and why can it mislead?",
      "a": "AOV = total revenue / number of orders. It is a mean, so a few very large orders can inflate it; also mixing categories (Electronics vs Books) hides differences. Report median order value and AOV by segment as well.",
      "level": "Medium"
    },
    {
      "q": "What is the difference between univariate, bivariate and multivariate analysis?",
      "a": "Univariate: one variable (distribution of revenue). Bivariate: relationship between two variables (revenue by category, discount vs quantity). Multivariate: three or more (revenue by category and city over time, pivot tables, pairplots, heatmaps).",
      "level": "Easy"
    },
    {
      "q": "What is Pareto / ABC analysis?",
      "a": "Sort items by contribution (revenue), compute cumulative share, and classify: A = items making ~80% of revenue, B = next ~15%, C = remaining ~5%. It identifies the vital few products/customers to prioritise for stock, service and marketing.",
      "level": "Medium"
    },
    {
      "q": "Revenue increased 20% but orders increased only 2%. What could explain it?",
      "a": "Revenue = orders x AOV, so AOV rose about 18%. Possible reasons: product mix shift to expensive categories, price increases, fewer discounts, more units per order, or a few very large B2B orders. Check AOV by category, discount levels, units per order and the outlier orders.",
      "level": "Hard"
    },
    {
      "q": "How do you handle outliers during EDA?",
      "a": "Detect with box plots, IQR or z-scores; check if they are errors (fix/remove) or genuine (bulk orders - keep, but report medians, analyse separately or cap for charts). Never delete silently; document the decision and its impact on totals.",
      "level": "Medium"
    },
    {
      "q": "How would you check for seasonality in sales data?",
      "a": "Aggregate by month/week (resample or groupby period), plot the line, compare the same months across years (YoY), compute each month's share of the yearly total, look at weekday patterns, and use rolling averages to separate trend from seasonal spikes. Festive months (Oct-Nov in India) usually stand out.",
      "level": "Medium"
    },
    {
      "q": "Correlation between discount and quantity is near zero. What would you conclude and recommend?",
      "a": "In this data, larger discounts are not associated with more units per order, so discounts mainly reduce revenue per order. I would recommend an A/B test of smaller discounts, check whether discounts increase the NUMBER of orders or new customers (a different metric), and note that correlation does not prove causation.",
      "level": "Hard"
    },
    {
      "q": "What is the difference between an observation and an insight?",
      "a": "An observation states a fact ('Electronics has the highest revenue'). An insight explains why it matters and what to do, backed by numbers ('Electronics gives 60% of revenue from 20% of orders, so a stock-out would hurt most; secure festive stock and monitor margin').",
      "level": "Easy"
    },
    {
      "q": "Which charts would you include in a one-page sales EDA summary?",
      "a": "KPI tiles (revenue, orders, AOV, return rate), monthly revenue line with MoM growth, revenue by category/region sorted bar, order value histogram or box plot, Pareto curve or top-10 table, and a region x category heatmap.",
      "level": "Medium"
    },
    {
      "q": "What limitations would you mention in an EDA report?",
      "a": "Data period (one year cannot confirm seasonality), imputed or removed records and their effect, missing fields (no cost so no profit, no customer IDs so no retention), possible tracking issues, sample size of small segments, and correlation versus causation.",
      "level": "Hard"
    }
  ],
  "practice": [
    {
      "task": "Using the dataset generator from the examples, compute revenue and AOV by channel (App vs Web) for delivered orders and state which channel has the higher AOV.",
      "hint": "groupby('channel').agg(revenue=..., orders=...), then revenue / orders",
      "solution": "# Start with the dataset generator + cleaning code from Step 3 (creates df and sales)\nch = sales.groupby(\"channel\").agg(revenue=(\"revenue\", \"sum\"), orders=(\"order_id\", \"count\"))\nch[\"aov\"] = (ch[\"revenue\"] / ch[\"orders\"]).round(0)\nprint(ch)\nprint(\"Higher AOV:\", ch[\"aov\"].idxmax())\n"
    },
    {
      "task": "Build a pivot table of revenue (in lakh, 1 decimal) by city (rows) and quarter (columns) with totals, and name the city-quarter with the highest revenue.",
      "hint": "sales['quarter'] = 'Q' + order_date.dt.quarter.astype(str); pivot_table(..., margins=True); stack() then idxmax()",
      "solution": "# Start with the dataset generator + cleaning code from Step 3 (creates df and sales)\nsales[\"quarter\"] = \"Q\" + sales[\"order_date\"].dt.quarter.astype(str)\npt = sales.pivot_table(index=\"city\", columns=\"quarter\", values=\"revenue\", aggfunc=\"sum\")\nprint((pt / 1e5).round(1))\nprint(\"Top city-quarter:\", pt.stack().idxmax())\n"
    },
    {
      "task": "Calculate the return rate (%) by city and by channel from the cleaned (not only delivered) data, and list cities whose return rate is above the overall return rate.",
      "hint": "df.assign(returned=df.status.eq('Returned')).groupby('city')['returned'].mean() * 100",
      "solution": "# Start with the dataset generator + cleaning code from Step 3 (creates df and sales)\ndf[\"returned\"] = df[\"status\"].eq(\"Returned\")\noverall = df[\"returned\"].mean() * 100\nby_city = (df.groupby(\"city\")[\"returned\"].mean() * 100).round(1)\nprint(by_city)\nprint((df.groupby(\"channel\")[\"returned\"].mean() * 100).round(1))\nprint(\"Above overall\", round(overall, 1), \":\", by_city[by_city > overall].index.tolist())\n"
    },
    {
      "task": "Write a function eda_profile(df) that prints shape, dtypes count, missing % per column (only columns with missing values), duplicate rows and numeric describe() - and run it on the raw dataset.",
      "hint": "Combine the profiling calls from Step 1 into one reusable function.",
      "solution": "# Start with the dataset generator from Step 1 (creates raw)\ndef eda_profile(data):\n    print(\"Shape:\", data.shape)\n    print(data.dtypes.value_counts())\n    miss = (data.isna().mean() * 100).round(2)\n    print(\"Missing %:\")\n    print(miss[miss > 0])\n    print(\"Duplicate rows:\", data.duplicated().sum())\n    print(data.describe().round(1))\n\neda_profile(raw)\n"
    }
  ],
  "quiz": [
    {
      "question": "AOV (Average Order Value) is calculated as:",
      "options": [
        "Revenue / customers",
        "Revenue / orders",
        "Orders / revenue",
        "Units / orders"
      ],
      "answer": 1,
      "explanation": "AOV = total revenue divided by number of orders."
    },
    {
      "question": "Which step should come BEFORE cleaning in EDA?",
      "options": [
        "Building the dashboard",
        "Profiling the data",
        "Writing recommendations",
        "Pareto analysis"
      ],
      "answer": 1,
      "explanation": "Profiling identifies the issues that cleaning must fix."
    },
    {
      "question": "In ABC analysis, 'A' items are those that:",
      "options": [
        "Have the most orders",
        "Make up roughly the first 80% of cumulative revenue",
        "Are alphabetically first",
        "Have the highest discount"
      ],
      "answer": 1,
      "explanation": "A-items are the vital few that contribute most revenue."
    },
    {
      "question": "For a right-skewed order value distribution, the best 'typical order' measure is:",
      "options": [
        "Mean",
        "Median",
        "Max",
        "Standard deviation"
      ],
      "answer": 1,
      "explanation": "The median is not pulled up by a few very large orders."
    },
    {
      "question": "Which chart best shows revenue seasonality across months?",
      "options": [
        "Pie chart",
        "Line chart",
        "Scatter plot",
        "Box plot"
      ],
      "answer": 1,
      "explanation": "Line charts show trends and seasonal patterns over time."
    },
    {
      "question": "Which is an insight rather than an observation?",
      "options": [
        "Fashion has 360 orders",
        "Mumbai is a city in the data",
        "Oct-Nov bring a large share of revenue, so festive stock must be ordered by August",
        "The dataset has 9 columns"
      ],
      "answer": 2,
      "explanation": "An insight links a finding to its business meaning and an action."
    }
  ]
};
