export default {
  "id": "day-13-seaborn-plotly-visualization",
  "title": "Seaborn Statistical Plots (Distribution, Categorical, Relational, Heatmap, Pairplot) and Plotly Intro",
  "module": "Module 3: Data Visualization",
  "day": 13,
  "level": "Intermediate",
  "duration": "3.5 hours",
  "summary": "Create attractive statistical charts with very little code using Seaborn: histplot/kdeplot, boxplot/violinplot/barplot/countplot, scatterplot/lineplot with hue, correlation heatmaps, pairplot, and figure-level functions with facets. Then build your first interactive charts with Plotly Express for dashboards and web reports.",
  "objectives": [
    "Explain how Seaborn builds on Matplotlib and works with tidy (long) pandas DataFrames",
    "Draw distribution plots: histplot, kdeplot, ecdfplot, boxplot and violinplot",
    "Draw categorical plots: countplot, barplot (with estimator and error bars) and stripplot",
    "Draw relational plots with hue/size/style, regplot, correlation heatmaps and pairplot",
    "Use figure-level functions (displot, catplot, relplot) with col/row facets, and themes",
    "Create interactive charts with Plotly Express and export them to HTML"
  ],
  "theory": [
    {
      "heading": "Why Seaborn?",
      "content": "Seaborn is a high-level library built on Matplotlib, designed for statistical graphics. You pass a DataFrame and column names; Seaborn handles grouping, aggregation, colours, legends and confidence intervals automatically. One line of Seaborn often replaces 10-15 lines of Matplotlib.\n\nSeaborn works best with **tidy (long) data**: one row per observation, one column per variable. Use `melt` (Day 8) to convert wide tables.",
      "syntax": "pip install seaborn\n\nimport seaborn as sns\nimport matplotlib.pyplot as plt\n\nsns.set_theme(style='whitegrid', palette='deep')\nsns.histplot(data=df, x='amount', hue='category')\nplt.show()",
      "points": [
        "**Axes-level** functions (histplot, boxplot, scatterplot ...) draw on one Matplotlib Axes and accept ax=",
        "**Figure-level** functions (displot, catplot, relplot, lmplot, pairplot) create their own figure and support facets with col= and row=",
        "Common parameters: data, x, y, hue (colour by category), palette, order, estimator",
        "`sns.load_dataset('tips')` loads sample datasets (needs internet)"
      ]
    },
    {
      "heading": "Distribution Plots",
      "content": "Use these to understand how a numeric variable is spread and how distributions differ between groups.",
      "syntax": "sns.histplot(data=df, x='amount', bins=30, kde=True)\nsns.histplot(data=df, x='amount', hue='channel', element='step', stat='density', common_norm=False)\nsns.kdeplot(data=df, x='amount', hue='category', fill=True)\nsns.ecdfplot(data=df, x='amount')\nsns.boxplot(data=df, x='category', y='amount')\nsns.violinplot(data=df, x='category', y='amount')",
      "points": [
        "histplot - counts per bin; kde=True overlays a smooth density curve",
        "kdeplot - smooth density estimate, good for comparing groups",
        "boxplot - median, quartiles, whiskers and outliers per group",
        "violinplot - box plot + density shape",
        "Use `log_scale=True` for heavily skewed data like income or order value"
      ]
    },
    {
      "heading": "Categorical Plots",
      "content": "Compare numbers across categories.",
      "syntax": "sns.countplot(data=df, x='category', order=df['category'].value_counts().index)\nsns.barplot(data=df, x='region', y='amount', estimator='sum', errorbar=None)\nsns.barplot(data=df, x='category', y='rating', hue='channel')   # mean with 95% CI\nsns.stripplot(data=df, x='category', y='amount', alpha=0.4)\nsns.pointplot(data=df, x='month', y='amount')",
      "tip": "barplot shows the MEAN by default with a 95% confidence interval error bar - it is not a sum! Pass estimator='sum' (or aggregate first) when you want totals, and errorbar=None to hide the bars."
    },
    {
      "heading": "Relational Plots, Regression and Heatmaps",
      "content": "Relationships between numeric variables:",
      "syntax": "sns.scatterplot(data=df, x='discount', y='rating', hue='category', size='amount')\nsns.lineplot(data=monthly, x='month', y='revenue', hue='region', marker='o')\nsns.regplot(data=df, x='discount', y='rating', scatter_kws={'alpha': 0.3})\ncorr = df[['amount', 'discount', 'rating']].corr()\nsns.heatmap(corr, annot=True, fmt='.2f', cmap='coolwarm', vmin=-1, vmax=1)\nsns.heatmap(pivot_table, annot=True, fmt=',.0f', cmap='Blues')",
      "points": [
        "lineplot aggregates repeated x values (mean + confidence band) automatically",
        "regplot / lmplot add a fitted regression line",
        "heatmap colours a 2D table: correlation matrices or pivot tables like region x month revenue"
      ]
    },
    {
      "heading": "pairplot, Facets and Themes",
      "content": "`sns.pairplot(df, hue='category')` draws scatter plots for every pair of numeric columns and distributions on the diagonal - a quick first look in EDA. Figure-level functions split data into small multiples with `col=` and `row=`, e.g. `sns.displot(data=df, x='amount', col='channel')`. Customise globally with `sns.set_theme(style='whitegrid', context='talk', palette='Set2')`.",
      "syntax": "sns.pairplot(df[['amount', 'discount', 'rating', 'category']], hue='category', corner=True)\ng = sns.catplot(data=df, x='category', y='amount', col='region', kind='box', col_wrap=3)\ng.set_axis_labels('Category', 'Amount (Rs)')\ng.savefig('facets.png')",
      "tip": "pairplot on many columns or many rows is slow. Select 3-5 important columns and sample rows: sns.pairplot(df.sample(500))."
    },
    {
      "heading": "Plotly Express: Interactive Charts",
      "content": "Plotly creates interactive charts that users can hover, zoom and filter in a browser - ideal for dashboards, Streamlit/Dash apps and HTML reports. **Plotly Express** (`import plotly.express as px`) has a Seaborn-like API: one function call per chart using a DataFrame and column names.",
      "syntax": "pip install plotly\n\nimport plotly.express as px\nfig = px.bar(summary, x='region', y='revenue', color='category', title='Revenue', text_auto=True)\nfig = px.line(monthly, x='month', y='revenue', color='region', markers=True)\nfig = px.scatter(df, x='discount', y='rating', color='category', size='amount', hover_data=['region'])\nfig = px.histogram(df, x='amount', nbins=30)\nfig = px.pie(df, names='channel', values='amount', hole=0.4)\nfig.show()                          # opens in notebook / browser\nfig.write_html('report.html')       # shareable interactive file",
      "points": [
        "Hover tooltips show exact values; legend items can be clicked to hide series",
        "animation_frame='month' creates animated charts",
        "Plotly charts are also used inside Dash and Streamlit web apps",
        "For static images (PNG) install kaleido: fig.write_image('chart.png')"
      ]
    }
  ],
  "examples": [
    {
      "title": "Distribution: histplot with KDE and Boxplot by Category",
      "scenario": "Understand order values overall (skewed) and compare their spread across product categories.",
      "steps": [
        "Seaborn is not available in the browser IDE - run this in Jupyter, Google Colab or VS Code",
        "Install once: pip install seaborn pandas matplotlib (already installed in Colab)",
        "Run the code; replace plt.savefig(...) with plt.show() to display the chart",
        "Compare the printed summary with the result below"
      ],
      "code": "import numpy as np\nimport pandas as pd\n\nrng = np.random.default_rng(11)\nn = 400\norders = pd.DataFrame({\n    \"category\": rng.choice([\"Electronics\", \"Fashion\", \"Home\", \"Books\"], n, p=[0.3, 0.3, 0.25, 0.15]),\n    \"channel\": rng.choice([\"App\", \"Web\"], n, p=[0.6, 0.4]),\n    \"region\": rng.choice([\"North\", \"South\", \"West\"], n),\n    \"discount\": rng.integers(0, 41, n),\n})\nbase = orders[\"category\"].map({\"Electronics\": 9000, \"Fashion\": 1800, \"Home\": 3500, \"Books\": 600})\norders[\"amount\"] = (base * rng.lognormal(0, 0.35, n)).round()\norders[\"rating\"] = np.clip(np.round(4.6 - orders[\"discount\"] * 0.02 + rng.normal(0, 0.4, n), 1), 1, 5)\nimport matplotlib\nmatplotlib.use(\"Agg\")\nimport matplotlib.pyplot as plt\nimport seaborn as sns\n\nsns.set_theme(style=\"whitegrid\")\nfig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))\nsns.histplot(data=orders, x=\"amount\", bins=30, kde=True, log_scale=True, ax=ax1)\nax1.set_title(\"Order Value (log scale)\")\norder = orders.groupby(\"category\")[\"amount\"].median().sort_values(ascending=False).index\nsns.boxplot(data=orders, x=\"category\", y=\"amount\", order=order, ax=ax2)\nax2.set_title(\"Order Value by Category\")\nfig.tight_layout()\nfig.savefig(\"distribution.png\", dpi=120)\n\nprint(orders.groupby(\"category\")[\"amount\"].median().sort_values(ascending=False))\nprint(\"Rows:\", len(orders))\n",
      "result": "category\nElectronics    8718.0\nHome           3339.5\nFashion        1775.0\nBooks           662.5\nName: amount, dtype: float64\nRows: 400",
      "explanation": "histplot with log_scale=True spreads out the skewed order values so the shape is visible; kde=True overlays a smooth curve. boxplot draws one box per category; sorting categories by median (order=) makes the comparison easy. The printed medians confirm what the boxes show: Electronics orders are far larger than Books orders."
    },
    {
      "title": "Categorical: countplot and barplot (Mean vs Sum)",
      "scenario": "Count orders per category by channel, and compare total revenue per region - showing the difference between barplot's default mean and estimator='sum'.",
      "steps": [
        "Seaborn is not available in the browser IDE - run this in Jupyter, Google Colab or VS Code",
        "Install once: pip install seaborn pandas matplotlib (already installed in Colab)",
        "Run the code; replace plt.savefig(...) with plt.show() to display the chart",
        "Compare the printed summary with the result below"
      ],
      "code": "import numpy as np\nimport pandas as pd\n\nrng = np.random.default_rng(11)\nn = 400\norders = pd.DataFrame({\n    \"category\": rng.choice([\"Electronics\", \"Fashion\", \"Home\", \"Books\"], n, p=[0.3, 0.3, 0.25, 0.15]),\n    \"channel\": rng.choice([\"App\", \"Web\"], n, p=[0.6, 0.4]),\n    \"region\": rng.choice([\"North\", \"South\", \"West\"], n),\n    \"discount\": rng.integers(0, 41, n),\n})\nbase = orders[\"category\"].map({\"Electronics\": 9000, \"Fashion\": 1800, \"Home\": 3500, \"Books\": 600})\norders[\"amount\"] = (base * rng.lognormal(0, 0.35, n)).round()\norders[\"rating\"] = np.clip(np.round(4.6 - orders[\"discount\"] * 0.02 + rng.normal(0, 0.4, n), 1), 1, 5)\nimport matplotlib\nmatplotlib.use(\"Agg\")\nimport matplotlib.pyplot as plt\nimport seaborn as sns\n\nsns.set_theme(style=\"whitegrid\", palette=\"Set2\")\nfig, axes = plt.subplots(1, 3, figsize=(15, 4))\nsns.countplot(data=orders, x=\"category\", hue=\"channel\",\n              order=orders[\"category\"].value_counts().index, ax=axes[0])\nsns.barplot(data=orders, x=\"region\", y=\"amount\", ax=axes[1])\naxes[1].set_title(\"Default: MEAN amount (95% CI)\")\nsns.barplot(data=orders, x=\"region\", y=\"amount\", estimator=\"sum\", errorbar=None, ax=axes[2])\naxes[2].set_title(\"estimator='sum': TOTAL amount\")\nfig.tight_layout()\nfig.savefig(\"categorical.png\", dpi=120)\n\nprint(pd.crosstab(orders[\"category\"], orders[\"channel\"]))\nprint(orders.groupby(\"region\")[\"amount\"].agg([\"mean\", \"sum\"]).round(0))\n",
      "result": "channel      App  Web\ncategory             \nBooks         37   17\nElectronics   77   56\nFashion       74   47\nHome          63   29\n          mean       sum\nregion                  \nNorth   4896.0  616878.0\nSouth   4220.0  594976.0\nWest    4662.0  620015.0",
      "explanation": "countplot counts rows per category and splits them by channel with hue. The middle chart uses barplot's default estimator (mean) with a 95% confidence interval; the right chart uses estimator='sum' for totals. Printing the same numbers with crosstab and groupby is a good habit - it verifies what the chart shows and gives exact values for your report."
    },
    {
      "title": "Relationship: scatterplot with hue, regplot and Correlation Heatmap",
      "scenario": "Does a higher discount reduce customer rating? Visualise the relationship and the correlation matrix of numeric columns.",
      "steps": [
        "Seaborn is not available in the browser IDE - run this in Jupyter, Google Colab or VS Code",
        "Install once: pip install seaborn pandas matplotlib (already installed in Colab)",
        "Run the code; replace plt.savefig(...) with plt.show() to display the chart",
        "Compare the printed summary with the result below"
      ],
      "code": "import numpy as np\nimport pandas as pd\n\nrng = np.random.default_rng(11)\nn = 400\norders = pd.DataFrame({\n    \"category\": rng.choice([\"Electronics\", \"Fashion\", \"Home\", \"Books\"], n, p=[0.3, 0.3, 0.25, 0.15]),\n    \"channel\": rng.choice([\"App\", \"Web\"], n, p=[0.6, 0.4]),\n    \"region\": rng.choice([\"North\", \"South\", \"West\"], n),\n    \"discount\": rng.integers(0, 41, n),\n})\nbase = orders[\"category\"].map({\"Electronics\": 9000, \"Fashion\": 1800, \"Home\": 3500, \"Books\": 600})\norders[\"amount\"] = (base * rng.lognormal(0, 0.35, n)).round()\norders[\"rating\"] = np.clip(np.round(4.6 - orders[\"discount\"] * 0.02 + rng.normal(0, 0.4, n), 1), 1, 5)\nimport matplotlib\nmatplotlib.use(\"Agg\")\nimport matplotlib.pyplot as plt\nimport seaborn as sns\n\nfig, axes = plt.subplots(1, 3, figsize=(16, 4.5))\nsns.scatterplot(data=orders, x=\"discount\", y=\"rating\", hue=\"channel\", alpha=0.6, ax=axes[0])\nsns.regplot(data=orders, x=\"discount\", y=\"rating\", scatter_kws={\"alpha\": 0.25},\n            line_kws={\"color\": \"red\"}, ax=axes[1])\ncorr = orders[[\"amount\", \"discount\", \"rating\"]].corr()\nsns.heatmap(corr, annot=True, fmt=\".2f\", cmap=\"coolwarm\", vmin=-1, vmax=1, ax=axes[2])\nfig.tight_layout()\nfig.savefig(\"relationship.png\", dpi=120)\n\nprint(corr.round(2))\n",
      "result": "          amount  discount  rating\namount      1.00      0.03   -0.02\ndiscount    0.03      1.00   -0.52\nrating     -0.02     -0.52    1.00",
      "explanation": "scatterplot shows each order as a dot coloured by channel; regplot adds a fitted line with a confidence band, clearly sloping down. The heatmap of the correlation matrix confirms a moderate negative correlation (about -0.5) between discount and rating, while amount is almost unrelated to both. Always fix vmin=-1 and vmax=1 for correlation heatmaps so colours are comparable."
    },
    {
      "title": "Pivot Heatmap and Facets with catplot",
      "scenario": "Show total revenue for every region x category as a heatmap, then compare amount distributions per category in separate panels for each channel.",
      "steps": [
        "Seaborn is not available in the browser IDE - run this in Jupyter, Google Colab or VS Code",
        "Install once: pip install seaborn pandas matplotlib (already installed in Colab)",
        "Run the code; replace plt.savefig(...) with plt.show() to display the chart",
        "Compare the printed summary with the result below"
      ],
      "code": "import numpy as np\nimport pandas as pd\n\nrng = np.random.default_rng(11)\nn = 400\norders = pd.DataFrame({\n    \"category\": rng.choice([\"Electronics\", \"Fashion\", \"Home\", \"Books\"], n, p=[0.3, 0.3, 0.25, 0.15]),\n    \"channel\": rng.choice([\"App\", \"Web\"], n, p=[0.6, 0.4]),\n    \"region\": rng.choice([\"North\", \"South\", \"West\"], n),\n    \"discount\": rng.integers(0, 41, n),\n})\nbase = orders[\"category\"].map({\"Electronics\": 9000, \"Fashion\": 1800, \"Home\": 3500, \"Books\": 600})\norders[\"amount\"] = (base * rng.lognormal(0, 0.35, n)).round()\norders[\"rating\"] = np.clip(np.round(4.6 - orders[\"discount\"] * 0.02 + rng.normal(0, 0.4, n), 1), 1, 5)\nimport matplotlib\nmatplotlib.use(\"Agg\")\nimport matplotlib.pyplot as plt\nimport seaborn as sns\n\npivot = orders.pivot_table(index=\"region\", columns=\"category\", values=\"amount\", aggfunc=\"sum\")\npivot_lakh = (pivot / 1e5).round(1)\nfig, ax = plt.subplots(figsize=(7, 3.5))\nsns.heatmap(pivot_lakh, annot=True, fmt=\".1f\", cmap=\"Blues\", ax=ax)\nax.set_title(\"Revenue (Rs lakh) by Region and Category\")\nfig.tight_layout()\nfig.savefig(\"heatmap.png\", dpi=120)\n\ng = sns.catplot(data=orders, x=\"category\", y=\"amount\", col=\"channel\", kind=\"box\", height=4)\ng.set_axis_labels(\"Category\", \"Amount (Rs)\")\ng.savefig(\"facets.png\")\n\nprint(pivot_lakh)\nprint(\"Facet panels:\", len(g.axes.flat))\n",
      "result": "category  Books  Electronics  Fashion  Home\nregion                                     \nNorth       0.1          4.3      0.8   1.0\nSouth       0.1          3.9      0.9   1.1\nWest        0.1          4.2      0.6   1.2\nFacet panels: 2",
      "explanation": "pivot_table creates the region x category grid, and heatmap colours each cell by value, with annotations showing the numbers - a compact replacement for a large table. catplot is figure-level: col='channel' creates one panel per channel (App and Web) with shared axes, which makes side-by-side comparison easy."
    },
    {
      "title": "Plotly Express: Interactive Bar and Scatter Charts",
      "scenario": "Build an interactive revenue chart and a scatter plot with hover details, and export them as an HTML file to share with a manager.",
      "steps": [
        "Run in Jupyter, Colab or VS Code: pip install plotly pandas",
        "Run the code - fig.show() opens interactive charts; report.html is created",
        "Open report.html in any browser and hover over bars and points"
      ],
      "code": "# pip install plotly\nimport pandas as pd\nimport plotly.express as px\n\nsummary = pd.DataFrame({\n    \"region\": [\"North\", \"North\", \"South\", \"South\", \"West\", \"West\"],\n    \"category\": [\"Electronics\", \"Fashion\", \"Electronics\", \"Fashion\", \"Electronics\", \"Fashion\"],\n    \"revenue\": [520000, 180000, 410000, 220000, 390000, 160000],\n})\nfig1 = px.bar(summary, x=\"region\", y=\"revenue\", color=\"category\", barmode=\"group\",\n              text_auto=\".2s\", title=\"Revenue by Region and Category\")\nfig1.show()\n\nproducts = pd.DataFrame({\n    \"product\": [\"Phone\", \"Laptop\", \"Shoes\", \"Watch\", \"Bag\", \"Headset\"],\n    \"discount\": [10, 5, 30, 20, 25, 15],\n    \"units\": [320, 120, 540, 260, 410, 300],\n    \"revenue\": [4800000, 6000000, 1350000, 1300000, 820000, 600000],\n})\nfig2 = px.scatter(products, x=\"discount\", y=\"units\", size=\"revenue\", color=\"product\",\n                  hover_data=[\"revenue\"], title=\"Discount vs Units Sold\")\nfig2.show()\n\nwith open(\"report.html\", \"w\") as f:\n    f.write(fig1.to_html(full_html=False, include_plotlyjs=\"cdn\"))\n    f.write(fig2.to_html(full_html=False, include_plotlyjs=False))\nprint(\"Charts:\", len(fig1.data), \"bar traces,\", len(fig2.data), \"scatter traces\")\nprint(\"Saved report.html\")\n",
      "result": "Charts: 2 bar traces, 6 scatter traces\nSaved report.html\n(plus two interactive charts: grouped bars per region with hover values, and a bubble chart where bubble size = revenue)",
      "explanation": "Plotly Express builds a chart from a DataFrame in one call. color= creates one trace per category (2 for the bar chart, 6 for the scatter because each product gets its own colour). barmode='group' places bars side by side, text_auto writes compact labels (520k), and size= turns the scatter into a bubble chart. to_html writes both charts into one shareable interactive HTML file that loads plotly.js from a CDN."
    }
  ],
  "interview": [
    {
      "q": "What is the difference between Matplotlib and Seaborn?",
      "a": "Matplotlib is the low-level plotting library with full control over every element. Seaborn is built on top of it, works directly with DataFrames, and provides high-level statistical plots (grouping, aggregation, confidence intervals, attractive defaults) with less code. You can customise Seaborn charts using Matplotlib functions.",
      "level": "Easy"
    },
    {
      "q": "What does the hue parameter do in Seaborn?",
      "a": "hue maps a column (usually categorical) to colour, splitting the plot into groups with a legend - e.g. hue='gender' draws separate coloured bars/points/curves per gender.",
      "level": "Easy"
    },
    {
      "q": "What does sns.barplot show by default?",
      "a": "The mean of y for each x category, with a 95% confidence interval error bar (bootstrapped). For totals use estimator='sum' or aggregate first; set errorbar=None to remove error bars.",
      "level": "Medium"
    },
    {
      "q": "countplot vs barplot vs histplot?",
      "a": "countplot counts rows per category (no y needed). barplot shows an aggregate (mean by default) of a numeric y per category. histplot shows the distribution of a numeric variable using bins.",
      "level": "Medium"
    },
    {
      "q": "What are figure-level and axes-level functions in Seaborn?",
      "a": "Axes-level functions (scatterplot, histplot, boxplot) draw on a single Matplotlib Axes and accept ax=. Figure-level functions (relplot, displot, catplot, lmplot, pairplot) create their own FacetGrid figure, support col/row faceting, and are sized with height/aspect.",
      "level": "Hard"
    },
    {
      "q": "How would you visualise correlations between many numeric variables?",
      "a": "Compute df.corr() and plot it with sns.heatmap(corr, annot=True, cmap='coolwarm', vmin=-1, vmax=1); optionally mask the upper triangle. For a few variables, sns.pairplot shows the full scatter matrix.",
      "level": "Medium"
    },
    {
      "q": "Box plot vs violin plot?",
      "a": "A box plot shows median, quartiles, whiskers and outliers. A violin plot adds a kernel density estimate showing the full distribution shape (e.g. bimodal), but can be harder for business audiences to read.",
      "level": "Medium"
    },
    {
      "q": "What is tidy (long) data and why does Seaborn need it?",
      "a": "Tidy data has one row per observation and one column per variable (e.g. columns month, region, revenue instead of one column per month). Seaborn maps columns to x, y, hue etc., so variables must be columns. Convert wide data with melt.",
      "level": "Medium"
    },
    {
      "q": "When would you use Plotly instead of Matplotlib/Seaborn?",
      "a": "When users need interactivity - hover tooltips, zoom, filtering through legends, animations - for web dashboards (Dash, Streamlit) or HTML reports. Matplotlib/Seaborn are better for static images in PDFs, papers and quick EDA.",
      "level": "Easy"
    },
    {
      "q": "How do you save a Seaborn figure-level plot?",
      "a": "Figure-level functions return a grid object: g = sns.catplot(...); g.savefig('file.png', dpi=150). For axes-level plots use plt.savefig or ax.figure.savefig.",
      "level": "Medium"
    },
    {
      "q": "How do you handle a very skewed variable in a histogram?",
      "a": "Use log_scale=True in sns.histplot (or log-transform with np.log1p), cap outliers for the chart, or show the distribution per segment. Also report median and percentiles instead of mean.",
      "level": "Hard"
    },
    {
      "q": "How do you export a Plotly chart?",
      "a": "fig.write_html('chart.html') for an interactive file (or to_html for embedding); fig.write_image('chart.png') for static images (requires the kaleido package).",
      "level": "Easy"
    }
  ],
  "practice": [
    {
      "task": "Create a DataFrame of 200 employees with dept (IT/HR/Sales/Ops) and salary (normal distribution, different means per dept). Draw a boxplot of salary by dept ordered by median salary.",
      "hint": "order=df.groupby('dept')['salary'].median().sort_values().index",
      "solution": "import numpy as np\nimport pandas as pd\nimport matplotlib\nmatplotlib.use(\"Agg\")\nimport matplotlib.pyplot as plt\nimport seaborn as sns\n\nrng = np.random.default_rng(2)\ndept = rng.choice([\"IT\", \"HR\", \"Sales\", \"Ops\"], 200)\nmeans = pd.Series(dept).map({\"IT\": 70000, \"HR\": 45000, \"Sales\": 55000, \"Ops\": 40000})\ndf = pd.DataFrame({\"dept\": dept, \"salary\": rng.normal(means, 8000)})\norder = df.groupby(\"dept\")[\"salary\"].median().sort_values().index\nax = sns.boxplot(data=df, x=\"dept\", y=\"salary\", order=order)\nax.figure.savefig(\"salary_box.png\")\nprint(list(order))\n"
    },
    {
      "task": "Draw a correlation heatmap for a DataFrame with columns ad_spend, visits, orders and returns (create sample data so that orders rise with visits).",
      "hint": "df.corr() then sns.heatmap(annot=True, vmin=-1, vmax=1)",
      "solution": "import numpy as np\nimport pandas as pd\nimport matplotlib\nmatplotlib.use(\"Agg\")\nimport seaborn as sns\n\nrng = np.random.default_rng(4)\nvisits = rng.integers(1000, 5000, 60)\ndf = pd.DataFrame({\n    \"ad_spend\": visits * 2 + rng.normal(0, 800, 60),\n    \"visits\": visits,\n    \"orders\": visits * 0.05 + rng.normal(0, 15, 60),\n    \"returns\": rng.integers(0, 20, 60),\n})\ncorr = df.corr()\nax = sns.heatmap(corr, annot=True, fmt=\".2f\", cmap=\"coolwarm\", vmin=-1, vmax=1)\nax.figure.savefig(\"corr.png\")\nprint(corr.round(2))\n"
    },
    {
      "task": "From a long table of monthly revenue by region (month, region, revenue), draw a sns.lineplot with one line per region and markers.",
      "hint": "sns.lineplot(data=df, x='month', y='revenue', hue='region', marker='o')",
      "solution": "import pandas as pd\nimport matplotlib\nmatplotlib.use(\"Agg\")\nimport seaborn as sns\n\ndf = pd.DataFrame({\n    \"month\": [\"Jan\", \"Feb\", \"Mar\"] * 2,\n    \"region\": [\"North\"] * 3 + [\"South\"] * 3,\n    \"revenue\": [50, 55, 61, 42, 47, 45],\n})\nax = sns.lineplot(data=df, x=\"month\", y=\"revenue\", hue=\"region\", marker=\"o\")\nax.figure.savefig(\"lines.png\")\nprint(\"done\")\n"
    },
    {
      "task": "Using Plotly Express, create an interactive donut chart of payment modes (UPI 58, Card 24, COD 12, Wallet 6) and save it to payments.html.",
      "hint": "px.pie(df, names='mode', values='share', hole=0.45); fig.write_html(...)",
      "solution": "import pandas as pd\nimport plotly.express as px\n\ndf = pd.DataFrame({\"mode\": [\"UPI\", \"Card\", \"COD\", \"Wallet\"], \"share\": [58, 24, 12, 6]})\nfig = px.pie(df, names=\"mode\", values=\"share\", hole=0.45, title=\"Payment Modes\")\nfig.write_html(\"payments.html\")\nfig.show()\n"
    }
  ],
  "quiz": [
    {
      "question": "Seaborn is built on top of which library?",
      "options": [
        "Plotly",
        "Matplotlib",
        "Bokeh",
        "ggplot2"
      ],
      "answer": 1,
      "explanation": "Seaborn uses Matplotlib for rendering."
    },
    {
      "question": "By default sns.barplot displays:",
      "options": [
        "Sum of y",
        "Count of rows",
        "Mean of y with a confidence interval",
        "Median of y"
      ],
      "answer": 2,
      "explanation": "The default estimator is the mean, with 95% CI error bars."
    },
    {
      "question": "Which function shows scatter plots for every pair of numeric columns?",
      "options": [
        "sns.heatmap",
        "sns.pairplot",
        "sns.catplot",
        "sns.jointplot"
      ],
      "answer": 1,
      "explanation": "pairplot creates a grid of pairwise relationships."
    },
    {
      "question": "Which Seaborn function is figure-level and supports col= facets?",
      "options": [
        "sns.boxplot",
        "sns.histplot",
        "sns.catplot",
        "sns.scatterplot"
      ],
      "answer": 2,
      "explanation": "catplot (like relplot, displot) creates a FacetGrid."
    },
    {
      "question": "Best Seaborn chart to display a correlation matrix?",
      "options": [
        "sns.heatmap",
        "sns.countplot",
        "sns.violinplot",
        "sns.ecdfplot"
      ],
      "answer": 0,
      "explanation": "heatmap colours each cell of the matrix and can annotate values."
    },
    {
      "question": "Which Plotly method saves an interactive chart for sharing?",
      "options": [
        "fig.savefig()",
        "fig.write_html()",
        "fig.to_csv()",
        "fig.export_png()"
      ],
      "answer": 1,
      "explanation": "write_html creates a standalone interactive HTML file."
    }
  ]
};
