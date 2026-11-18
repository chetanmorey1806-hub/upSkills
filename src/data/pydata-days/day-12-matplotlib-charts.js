export default {
  "id": "day-12-matplotlib-charts",
  "title": "Data Visualization with Matplotlib: Line, Bar, Pie, Histogram, Scatter and Subplots",
  "module": "Module 3: Data Visualization",
  "day": 12,
  "level": "Intermediate",
  "duration": "3.5 hours",
  "summary": "Create clear business charts with Matplotlib: understand Figure and Axes, draw line, bar, horizontal bar, stacked bar, pie/donut, histogram, box and scatter plots, combine them with subplots, style them with titles, labels, legends, annotations, number formatting and styles, plot directly from pandas, and save charts for reports.",
  "objectives": [
    "Explain the Figure/Axes model and use the object-oriented API (fig, ax = plt.subplots())",
    "Choose the right chart for trends, comparisons, composition, distribution and relationships",
    "Draw line, bar, barh, stacked bar, pie, histogram, box and scatter plots",
    "Build dashboards with subplots, and add titles, labels, legends, annotations and formatted axes",
    "Plot from pandas with df.plot and save charts with savefig(dpi, bbox_inches)"
  ],
  "theory": [
    {
      "heading": "Matplotlib Basics: Figure and Axes",
      "content": "Matplotlib is the foundation of plotting in Python; pandas and Seaborn use it underneath. A **Figure** is the whole image (the canvas). An **Axes** is one chart inside it, with its own x-axis, y-axis, title and data. A figure can contain many axes (subplots).\n\nThere are two styles: the quick **pyplot** style (`plt.plot(...)`, `plt.title(...)`) and the recommended **object-oriented** style (`fig, ax = plt.subplots()` then `ax.plot(...)`, `ax.set_title(...)`), which is clearer when you have several charts.",
      "syntax": "import matplotlib.pyplot as plt\n\nfig, ax = plt.subplots(figsize=(8, 4))\nax.plot(months, sales, marker='o')\nax.set_title('Monthly Sales')\nax.set_xlabel('Month')\nax.set_ylabel('Sales (Rs)')\nplt.tight_layout()\nplt.savefig('sales.png', dpi=150)\nplt.show()      # in scripts / VS Code; Jupyter shows charts automatically"
    },
    {
      "heading": "Choosing the Right Chart",
      "content": "The most important visualization skill is picking a chart that answers the question.",
      "points": [
        "**Trend over time** - line chart (monthly revenue)",
        "**Compare categories** - bar / horizontal bar (revenue by region; use barh for long names and sort the bars)",
        "**Composition / part of whole** - stacked bar or pie/donut (only for 2-5 slices)",
        "**Distribution of one variable** - histogram or box plot (order values, salaries)",
        "**Relationship between two numbers** - scatter plot (ad spend vs sales)",
        "**Many KPIs at once** - subplots / dashboard grid"
      ],
      "tip": "Start bar charts at zero, avoid 3D charts, keep colours meaningful (highlight one bar instead of rainbow colours) and always label axes with units."
    },
    {
      "heading": "Core Plot Functions",
      "content": "Each chart type is a method of an Axes object.",
      "syntax": "ax.plot(x, y, color='tab:blue', linestyle='--', marker='o', label='2024')\nax.bar(categories, values, color='steelblue')\nax.barh(categories, values)\nax.bar(x, a, label='Online'); ax.bar(x, b, bottom=a, label='Store')   # stacked\nax.pie(values, labels=labels, autopct='%1.1f%%', startangle=90)\nax.hist(data, bins=20, edgecolor='white')\nax.boxplot([group1, group2])\nax.scatter(x, y, s=sizes, c=colors, alpha=0.7)"
    },
    {
      "heading": "Styling and Annotation",
      "content": "Small touches make charts presentation-ready.",
      "points": [
        "`ax.legend(title=...)` - shows labels given with label=",
        "`ax.grid(axis='y', alpha=0.3)` - light gridlines",
        "`ax.annotate('Diwali peak', xy=(x, y), xytext=(x2, y2), arrowprops=dict(arrowstyle='->'))` - point out an event",
        "`ax.bar_label(bars, fmt='%.0f')` - value labels on bars (Matplotlib 3.4+)",
        "`ax.yaxis.set_major_formatter(FuncFormatter(lambda v, p: f'{v/1e5:.0f}L'))` - show lakhs; `PercentFormatter` for %",
        "`ax.set_ylim(0, ...)`, `ax.tick_params(axis='x', rotation=45)`",
        "`plt.style.use('ggplot')` or `'seaborn-v0_8'` - change the overall look; `plt.style.available` lists styles",
        "`ax.spines[['top', 'right']].set_visible(False)` - cleaner look"
      ]
    },
    {
      "heading": "Subplots and Dashboards",
      "content": "`plt.subplots(nrows, ncols)` returns a figure and an array of axes. Index them like a NumPy array: `axes[0, 1]`. Use `figsize` to control size, `sharey=True` to share scales, `fig.suptitle` for an overall title and `tight_layout()` to prevent overlaps.",
      "syntax": "fig, axes = plt.subplots(2, 2, figsize=(12, 8))\naxes[0, 0].plot(...)\naxes[0, 1].bar(...)\naxes[1, 0].hist(...)\naxes[1, 1].scatter(...)\nfig.suptitle('Sales Dashboard - FY 2024')\nfig.tight_layout()"
    },
    {
      "heading": "Plotting Directly from pandas and Saving",
      "content": "pandas has a built-in `.plot()` that calls Matplotlib: `df.plot(kind='line'|'bar'|'barh'|'hist'|'box'|'pie'|'scatter'|'area')`. The index becomes the x-axis and each column becomes a series. It returns an Axes, so you can keep styling with Matplotlib.\n\nSave charts with `fig.savefig('chart.png', dpi=150, bbox_inches='tight')` for reports and PowerPoint. Use .svg or .pdf for sharp vector graphics. Call `plt.close(fig)` in loops to free memory.",
      "syntax": "ax = monthly.plot(kind='line', marker='o', figsize=(8, 4), title='Revenue')\nax.set_ylabel('Rs')\nregion_sales.sort_values().plot(kind='barh')\ndf['amount'].plot(kind='hist', bins=20)\nax.figure.savefig('revenue.png', dpi=150, bbox_inches='tight')"
    }
  ],
  "examples": [
    {
      "title": "Line Chart: Monthly Revenue Trend with Annotation",
      "scenario": "Plot two years of monthly revenue on one chart, mark the festive peak and save it for the monthly review deck.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with matplotlib installed)",
        "Paste the code into main.py and run it - the chart is saved as chart.png (in Jupyter/VS Code use plt.show() to display it)",
        "Compare the printed summary with the result below"
      ],
      "code": "import matplotlib\nmatplotlib.use(\"Agg\")\nimport matplotlib.pyplot as plt\n\nmonths = [\"Jan\", \"Feb\", \"Mar\", \"Apr\", \"May\", \"Jun\", \"Jul\", \"Aug\", \"Sep\", \"Oct\", \"Nov\", \"Dec\"]\nrev_2023 = [40, 42, 45, 43, 47, 50, 52, 51, 55, 58, 62, 70]\nrev_2024 = [46, 47, 50, 49, 54, 57, 60, 58, 63, 66, 78, 80]\n\nfig, ax = plt.subplots(figsize=(9, 4))\nax.plot(months, rev_2023, marker=\"o\", linestyle=\"--\", color=\"gray\", label=\"2023\")\nax.plot(months, rev_2024, marker=\"o\", color=\"tab:blue\", linewidth=2, label=\"2024\")\nax.annotate(\"Diwali sale\", xy=(10, 78), xytext=(6.5, 76),\n            arrowprops=dict(arrowstyle=\"->\"))\nax.set_title(\"Monthly Revenue (Rs lakh)\")\nax.set_xlabel(\"Month\")\nax.set_ylabel(\"Revenue (Rs lakh)\")\nax.grid(axis=\"y\", alpha=0.3)\nax.legend()\nfig.tight_layout()\nfig.savefig(\"chart.png\", dpi=120)\n\nprint(\"Lines plotted:\", len(ax.get_lines()))\nprint(\"Title:\", ax.get_title())\nprint(\"Legend:\", [t.get_text() for t in ax.get_legend().get_texts()])\ngrowth = (sum(rev_2024) / sum(rev_2023) - 1) * 100\nprint(f\"YoY growth: {growth:.1f}%\")\nprint(\"Saved chart.png\")\n",
      "python": {
        "files": {
          "main.py": "import matplotlib\nmatplotlib.use(\"Agg\")\nimport matplotlib.pyplot as plt\n\nmonths = [\"Jan\", \"Feb\", \"Mar\", \"Apr\", \"May\", \"Jun\", \"Jul\", \"Aug\", \"Sep\", \"Oct\", \"Nov\", \"Dec\"]\nrev_2023 = [40, 42, 45, 43, 47, 50, 52, 51, 55, 58, 62, 70]\nrev_2024 = [46, 47, 50, 49, 54, 57, 60, 58, 63, 66, 78, 80]\n\nfig, ax = plt.subplots(figsize=(9, 4))\nax.plot(months, rev_2023, marker=\"o\", linestyle=\"--\", color=\"gray\", label=\"2023\")\nax.plot(months, rev_2024, marker=\"o\", color=\"tab:blue\", linewidth=2, label=\"2024\")\nax.annotate(\"Diwali sale\", xy=(10, 78), xytext=(6.5, 76),\n            arrowprops=dict(arrowstyle=\"->\"))\nax.set_title(\"Monthly Revenue (Rs lakh)\")\nax.set_xlabel(\"Month\")\nax.set_ylabel(\"Revenue (Rs lakh)\")\nax.grid(axis=\"y\", alpha=0.3)\nax.legend()\nfig.tight_layout()\nfig.savefig(\"chart.png\", dpi=120)\n\nprint(\"Lines plotted:\", len(ax.get_lines()))\nprint(\"Title:\", ax.get_title())\nprint(\"Legend:\", [t.get_text() for t in ax.get_legend().get_texts()])\ngrowth = (sum(rev_2024) / sum(rev_2023) - 1) * 100\nprint(f\"YoY growth: {growth:.1f}%\")\nprint(\"Saved chart.png\")\n"
        }
      },
      "result": "Lines plotted: 2\nTitle: Monthly Revenue (Rs lakh)\nLegend: ['2023', '2024']\nYoY growth: 15.1%\nSaved chart.png",
      "explanation": "Two ax.plot calls draw two series on the same axes; label= feeds the legend. A dashed grey line for last year and a solid coloured line for this year make the comparison obvious. annotate draws an arrow from the text to the November point (x position 10, since categories are numbered from 0). In the browser IDE there is no screen, so the chart is saved to chart.png and we print a summary; locally add plt.show()."
    },
    {
      "title": "Sorted Horizontal Bar Chart with Value Labels",
      "scenario": "Compare revenue across cities, highlighting the top city, with values written on the bars.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with matplotlib installed)",
        "Paste the code into main.py and run it - the chart is saved as chart.png (in Jupyter/VS Code use plt.show() to display it)",
        "Compare the printed summary with the result below"
      ],
      "code": "import matplotlib\nmatplotlib.use(\"Agg\")\nimport matplotlib.pyplot as plt\nimport pandas as pd\n\ncity_rev = pd.Series({\"Mumbai\": 9.8, \"Delhi\": 8.1, \"Bengaluru\": 7.4,\n                      \"Pune\": 5.2, \"Chennai\": 4.6, \"Kolkata\": 3.9}).sort_values()\ncolors = [\"tab:orange\" if v == city_rev.max() else \"lightsteelblue\" for v in city_rev]\n\nfig, ax = plt.subplots(figsize=(7, 4))\nbars = ax.barh(city_rev.index, city_rev.values, color=colors)\nax.bar_label(bars, fmt=\"%.1f\", padding=3)\nax.set_title(\"Revenue by City (Rs crore)\")\nax.set_xlabel(\"Revenue (Rs crore)\")\nax.spines[[\"top\", \"right\"]].set_visible(False)\nfig.tight_layout()\nfig.savefig(\"chart.png\", dpi=120)\n\nprint(\"Bars:\", len(bars))\nprint(\"Order bottom->top:\", list(city_rev.index))\nprint(\"Highlighted:\", city_rev.idxmax())\nprint(\"Top city share:\", round(city_rev.max() / city_rev.sum() * 100, 1), \"%\")\n",
      "python": {
        "files": {
          "main.py": "import matplotlib\nmatplotlib.use(\"Agg\")\nimport matplotlib.pyplot as plt\nimport pandas as pd\n\ncity_rev = pd.Series({\"Mumbai\": 9.8, \"Delhi\": 8.1, \"Bengaluru\": 7.4,\n                      \"Pune\": 5.2, \"Chennai\": 4.6, \"Kolkata\": 3.9}).sort_values()\ncolors = [\"tab:orange\" if v == city_rev.max() else \"lightsteelblue\" for v in city_rev]\n\nfig, ax = plt.subplots(figsize=(7, 4))\nbars = ax.barh(city_rev.index, city_rev.values, color=colors)\nax.bar_label(bars, fmt=\"%.1f\", padding=3)\nax.set_title(\"Revenue by City (Rs crore)\")\nax.set_xlabel(\"Revenue (Rs crore)\")\nax.spines[[\"top\", \"right\"]].set_visible(False)\nfig.tight_layout()\nfig.savefig(\"chart.png\", dpi=120)\n\nprint(\"Bars:\", len(bars))\nprint(\"Order bottom->top:\", list(city_rev.index))\nprint(\"Highlighted:\", city_rev.idxmax())\nprint(\"Top city share:\", round(city_rev.max() / city_rev.sum() * 100, 1), \"%\")\n"
        }
      },
      "result": "Bars: 6\nOrder bottom->top: ['Kolkata', 'Chennai', 'Pune', 'Bengaluru', 'Delhi', 'Mumbai']\nHighlighted: Mumbai\nTop city share: 25.1 %",
      "explanation": "Sorting the Series before plotting makes the longest bar appear at the top of a horizontal bar chart - much easier to read than random order. A single highlight colour draws attention to the key message. bar_label writes each value at the end of its bar, and removing the top/right spines gives a clean modern look."
    },
    {
      "title": "Pie/Donut and Stacked Bar for Composition",
      "scenario": "Show payment-mode share as a donut chart and online vs store sales per quarter as a stacked bar, side by side.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with matplotlib installed)",
        "Paste the code into main.py and run it - the chart is saved as chart.png (in Jupyter/VS Code use plt.show() to display it)",
        "Compare the printed summary with the result below"
      ],
      "code": "import matplotlib\nmatplotlib.use(\"Agg\")\nimport matplotlib.pyplot as plt\nimport numpy as np\n\nmodes = [\"UPI\", \"Card\", \"COD\", \"Wallet\"]\nshare = [58, 24, 12, 6]\nquarters = [\"Q1\", \"Q2\", \"Q3\", \"Q4\"]\nonline = np.array([120, 135, 150, 210])\nstore = np.array([90, 95, 88, 110])\n\nfig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 4))\nwedges, texts, autotexts = ax1.pie(share, labels=modes, autopct=\"%1.0f%%\", startangle=90,\n                                   wedgeprops=dict(width=0.4))\nax1.set_title(\"Payment Mode Share\")\n\nax2.bar(quarters, online, label=\"Online\", color=\"tab:blue\")\nax2.bar(quarters, store, bottom=online, label=\"Store\", color=\"tab:green\")\nax2.set_title(\"Sales by Channel (Rs lakh)\")\nax2.legend()\nfig.tight_layout()\nfig.savefig(\"chart.png\", dpi=120)\n\nprint(\"Pie labels:\", [t.get_text() for t in autotexts])\nprint(\"Stacked totals:\", (online + store).tolist())\nprint(\"Online share Q4:\", round(online[-1] / (online[-1] + store[-1]) * 100, 1), \"%\")\n",
      "python": {
        "files": {
          "main.py": "import matplotlib\nmatplotlib.use(\"Agg\")\nimport matplotlib.pyplot as plt\nimport numpy as np\n\nmodes = [\"UPI\", \"Card\", \"COD\", \"Wallet\"]\nshare = [58, 24, 12, 6]\nquarters = [\"Q1\", \"Q2\", \"Q3\", \"Q4\"]\nonline = np.array([120, 135, 150, 210])\nstore = np.array([90, 95, 88, 110])\n\nfig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 4))\nwedges, texts, autotexts = ax1.pie(share, labels=modes, autopct=\"%1.0f%%\", startangle=90,\n                                   wedgeprops=dict(width=0.4))\nax1.set_title(\"Payment Mode Share\")\n\nax2.bar(quarters, online, label=\"Online\", color=\"tab:blue\")\nax2.bar(quarters, store, bottom=online, label=\"Store\", color=\"tab:green\")\nax2.set_title(\"Sales by Channel (Rs lakh)\")\nax2.legend()\nfig.tight_layout()\nfig.savefig(\"chart.png\", dpi=120)\n\nprint(\"Pie labels:\", [t.get_text() for t in autotexts])\nprint(\"Stacked totals:\", (online + store).tolist())\nprint(\"Online share Q4:\", round(online[-1] / (online[-1] + store[-1]) * 100, 1), \"%\")\n"
        }
      },
      "result": "Pie labels: ['58%', '24%', '12%', '6%']\nStacked totals: [210, 230, 238, 320]\nOnline share Q4: 65.6 %",
      "explanation": "wedgeprops width=0.4 turns a pie into a donut, and autopct writes percentages. For stacking, the second bar call uses bottom=online so store sales sit on top of online sales; the bar height then equals the quarter total. Pie charts work only for a few categories - for more, use a sorted bar chart."
    },
    {
      "title": "Histogram and Box Plot of Order Values",
      "scenario": "Understand the distribution of 500 order values: shape, median, and outliers.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with matplotlib installed)",
        "Paste the code into main.py and run it - the chart is saved as chart.png (in Jupyter/VS Code use plt.show() to display it)",
        "Compare the printed summary with the result below"
      ],
      "code": "import matplotlib\nmatplotlib.use(\"Agg\")\nimport matplotlib.pyplot as plt\nimport numpy as np\n\nrng = np.random.default_rng(42)\norders = np.round(rng.lognormal(mean=7, sigma=0.5, size=500))\n\nfig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 4))\ncounts, edges, _ = ax1.hist(orders, bins=20, color=\"tab:purple\", edgecolor=\"white\")\nax1.axvline(np.median(orders), color=\"black\", linestyle=\"--\", label=\"Median\")\nax1.axvline(orders.mean(), color=\"red\", linestyle=\":\", label=\"Mean\")\nax1.set_title(\"Order Value Distribution\")\nax1.set_xlabel(\"Order value (Rs)\")\nax1.legend()\nax2.boxplot(orders, vert=False)\nax2.set_title(\"Box Plot\")\nfig.tight_layout()\nfig.savefig(\"chart.png\", dpi=120)\n\nq1, q3 = np.percentile(orders, [25, 75])\nupper = q3 + 1.5 * (q3 - q1)\nprint(\"Bins:\", len(counts), \"Total counted:\", int(counts.sum()))\nprint(\"Median:\", np.median(orders), \"Mean:\", round(orders.mean(), 1))\nprint(\"Right-skewed:\", orders.mean() > np.median(orders))\nprint(\"Outliers above\", round(upper, 1), \":\", int((orders > upper).sum()))\n",
      "python": {
        "files": {
          "main.py": "import matplotlib\nmatplotlib.use(\"Agg\")\nimport matplotlib.pyplot as plt\nimport numpy as np\n\nrng = np.random.default_rng(42)\norders = np.round(rng.lognormal(mean=7, sigma=0.5, size=500))\n\nfig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 4))\ncounts, edges, _ = ax1.hist(orders, bins=20, color=\"tab:purple\", edgecolor=\"white\")\nax1.axvline(np.median(orders), color=\"black\", linestyle=\"--\", label=\"Median\")\nax1.axvline(orders.mean(), color=\"red\", linestyle=\":\", label=\"Mean\")\nax1.set_title(\"Order Value Distribution\")\nax1.set_xlabel(\"Order value (Rs)\")\nax1.legend()\nax2.boxplot(orders, vert=False)\nax2.set_title(\"Box Plot\")\nfig.tight_layout()\nfig.savefig(\"chart.png\", dpi=120)\n\nq1, q3 = np.percentile(orders, [25, 75])\nupper = q3 + 1.5 * (q3 - q1)\nprint(\"Bins:\", len(counts), \"Total counted:\", int(counts.sum()))\nprint(\"Median:\", np.median(orders), \"Mean:\", round(orders.mean(), 1))\nprint(\"Right-skewed:\", orders.mean() > np.median(orders))\nprint(\"Outliers above\", round(upper, 1), \":\", int((orders > upper).sum()))\n"
        }
      },
      "result": "Bins: 20 Total counted: 500\nMedian: 1098.5 Mean: 1224.2\nRight-skewed: True\nOutliers above 2499.2 : 24",
      "explanation": "Order values are usually right-skewed (many small orders, a few large ones), simulated here with a lognormal distribution. The histogram shows the shape; vertical lines mark the median and mean (mean > median confirms the skew). The box plot shows the median line, the IQR box and points beyond the whiskers (outliers) - the same IQR rule from Day 7."
    },
    {
      "title": "2x2 Dashboard from a pandas DataFrame",
      "scenario": "Build a one-page sales dashboard: monthly trend, category revenue, discount vs units scatter and a units histogram, using pandas plotting plus Matplotlib styling.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with matplotlib installed)",
        "Paste the code into main.py and run it - the chart is saved as chart.png (in Jupyter/VS Code use plt.show() to display it)",
        "Compare the printed summary with the result below"
      ],
      "code": "import matplotlib\nmatplotlib.use(\"Agg\")\nimport matplotlib.pyplot as plt\nimport numpy as np\nimport pandas as pd\n\nrng = np.random.default_rng(7)\nn = 300\ndf = pd.DataFrame({\n    \"date\": pd.Timestamp(\"2024-01-01\") + pd.to_timedelta(rng.integers(0, 180, n), unit=\"D\"),\n    \"category\": rng.choice([\"Electronics\", \"Fashion\", \"Home\", \"Books\"], n),\n    \"discount\": rng.integers(0, 40, n),\n})\ndf[\"units\"] = (5 + df[\"discount\"] * 0.3 + rng.normal(0, 2, n)).round().clip(1)\ndf[\"revenue\"] = df[\"units\"] * 500\n\nplt.style.use(\"ggplot\")\nfig, axes = plt.subplots(2, 2, figsize=(12, 8))\nmonthly = df.resample(\"ME\", on=\"date\")[\"revenue\"].sum()\nmonthly.plot(ax=axes[0, 0], marker=\"o\", title=\"Monthly Revenue\")\ndf.groupby(\"category\")[\"revenue\"].sum().sort_values().plot(kind=\"barh\", ax=axes[0, 1],\n                                                           title=\"Revenue by Category\")\ndf.plot(kind=\"scatter\", x=\"discount\", y=\"units\", alpha=0.5, ax=axes[1, 0],\n        title=\"Discount vs Units\")\ndf[\"units\"].plot(kind=\"hist\", bins=15, ax=axes[1, 1], title=\"Units per Order\")\nfig.suptitle(\"Sales Dashboard - H1 2024\")\nfig.tight_layout()\nfig.savefig(\"chart.png\", dpi=100)\n\nprint(\"Axes in figure:\", len(fig.axes))\nprint(\"Months plotted:\", len(monthly))\nprint(\"Top category:\", df.groupby(\"category\")[\"revenue\"].sum().idxmax())\nprint(\"Correlation discount-units:\", round(df[\"discount\"].corr(df[\"units\"]), 2))\n",
      "python": {
        "files": {
          "main.py": "import matplotlib\nmatplotlib.use(\"Agg\")\nimport matplotlib.pyplot as plt\nimport numpy as np\nimport pandas as pd\n\nrng = np.random.default_rng(7)\nn = 300\ndf = pd.DataFrame({\n    \"date\": pd.Timestamp(\"2024-01-01\") + pd.to_timedelta(rng.integers(0, 180, n), unit=\"D\"),\n    \"category\": rng.choice([\"Electronics\", \"Fashion\", \"Home\", \"Books\"], n),\n    \"discount\": rng.integers(0, 40, n),\n})\ndf[\"units\"] = (5 + df[\"discount\"] * 0.3 + rng.normal(0, 2, n)).round().clip(1)\ndf[\"revenue\"] = df[\"units\"] * 500\n\nplt.style.use(\"ggplot\")\nfig, axes = plt.subplots(2, 2, figsize=(12, 8))\nmonthly = df.resample(\"ME\", on=\"date\")[\"revenue\"].sum()\nmonthly.plot(ax=axes[0, 0], marker=\"o\", title=\"Monthly Revenue\")\ndf.groupby(\"category\")[\"revenue\"].sum().sort_values().plot(kind=\"barh\", ax=axes[0, 1],\n                                                           title=\"Revenue by Category\")\ndf.plot(kind=\"scatter\", x=\"discount\", y=\"units\", alpha=0.5, ax=axes[1, 0],\n        title=\"Discount vs Units\")\ndf[\"units\"].plot(kind=\"hist\", bins=15, ax=axes[1, 1], title=\"Units per Order\")\nfig.suptitle(\"Sales Dashboard - H1 2024\")\nfig.tight_layout()\nfig.savefig(\"chart.png\", dpi=100)\n\nprint(\"Axes in figure:\", len(fig.axes))\nprint(\"Months plotted:\", len(monthly))\nprint(\"Top category:\", df.groupby(\"category\")[\"revenue\"].sum().idxmax())\nprint(\"Correlation discount-units:\", round(df[\"discount\"].corr(df[\"units\"]), 2))\n"
        }
      },
      "result": "Axes in figure: 4\nMonths plotted: 6\nTop category: Books\nCorrelation discount-units: 0.89",
      "explanation": "plt.subplots(2, 2) creates four axes; each pandas .plot call receives ax= to draw into a specific panel. resample gives monthly totals for the line chart, groupby + sort_values feeds the bar chart, and kind='scatter' shows a clear positive relationship between discount and units (correlation about 0.9). plt.style.use('ggplot') changes the look of every chart at once."
    }
  ],
  "interview": [
    {
      "q": "What is the difference between a Figure and an Axes in Matplotlib?",
      "a": "The Figure is the whole canvas/window. An Axes is an individual plot area inside the figure with its own x/y axes, title and data. One figure can hold many axes (subplots).",
      "level": "Easy"
    },
    {
      "q": "What is the difference between plt.plot() and ax.plot()?",
      "a": "plt.plot uses the pyplot state machine and draws on the 'current' axes - fine for quick single charts. ax.plot is the object-oriented API that draws on a specific Axes - clearer and recommended for multiple subplots and reusable functions.",
      "level": "Medium"
    },
    {
      "q": "Which chart would you use to show sales trend, category comparison, distribution and correlation?",
      "a": "Trend: line chart. Category comparison: (sorted) bar chart. Distribution: histogram or box plot. Correlation between two numeric variables: scatter plot (or heatmap for many variables).",
      "level": "Easy"
    },
    {
      "q": "Histogram vs bar chart?",
      "a": "A histogram shows the distribution of a continuous numeric variable by grouping values into bins (bars touch). A bar chart compares values of discrete categories (bars separated, order can be changed).",
      "level": "Easy"
    },
    {
      "q": "Why are pie charts often discouraged?",
      "a": "Humans compare angles and areas poorly, so slices of similar size are hard to compare, and with more than 4-5 categories they become unreadable. A sorted bar chart communicates the same information more accurately.",
      "level": "Medium"
    },
    {
      "q": "How do you create multiple charts in one figure?",
      "a": "fig, axes = plt.subplots(nrows, ncols, figsize=(w, h)); then draw on axes[i, j]. Use sharex/sharey for common scales, fig.suptitle for a title and fig.tight_layout() to avoid overlap. plt.subplot2grid or GridSpec allow uneven layouts.",
      "level": "Medium"
    },
    {
      "q": "How do you save a chart in high quality for a report?",
      "a": "fig.savefig('chart.png', dpi=300, bbox_inches='tight') for raster images, or save as .svg/.pdf for vector quality. Call savefig before plt.show(), because show may clear the figure.",
      "level": "Easy"
    },
    {
      "q": "How do you add values on top of bars?",
      "a": "bars = ax.bar(x, y); ax.bar_label(bars, fmt='%.0f'). In older versions loop over bars and call ax.text(bar.get_x() + bar.get_width()/2, bar.get_height(), value, ha='center').",
      "level": "Medium"
    },
    {
      "q": "How do you create a stacked bar chart?",
      "a": "Draw the first series with ax.bar(x, a) and the next with ax.bar(x, b, bottom=a); for a third use bottom=a+b. With pandas: df.plot(kind='bar', stacked=True).",
      "level": "Medium"
    },
    {
      "q": "How do you format the y-axis to show values in lakhs or as percentages?",
      "a": "Use matplotlib.ticker: ax.yaxis.set_major_formatter(FuncFormatter(lambda v, pos: f'{v/1e5:.0f}L')) or PercentFormatter(xmax=1) for fractions.",
      "level": "Hard"
    },
    {
      "q": "Your chart shows a misleading big difference between two bars. What might be wrong?",
      "a": "The y-axis probably does not start at zero (truncated axis), exaggerating differences. Bar charts should start at 0. Also check for inconsistent scales between subplots, dual axes and cherry-picked time ranges.",
      "level": "Hard"
    },
    {
      "q": "How does pandas plotting relate to Matplotlib?",
      "a": "DataFrame.plot / Series.plot are wrappers around Matplotlib. They use the index as x and columns as series, and return a Matplotlib Axes so you can customise further (ax.set_title, ax.figure.savefig).",
      "level": "Easy"
    }
  ],
  "practice": [
    {
      "task": "Plot daily website visitors for one week (Mon-Sun: [1200, 1350, 1100, 1500, 1700, 2300, 2100]) as a line chart with markers, title, axis labels and save it as visits.png.",
      "hint": "fig, ax = plt.subplots(); ax.plot(days, visits, marker='o')",
      "solution": "import matplotlib\nmatplotlib.use(\"Agg\")\nimport matplotlib.pyplot as plt\n\ndays = [\"Mon\", \"Tue\", \"Wed\", \"Thu\", \"Fri\", \"Sat\", \"Sun\"]\nvisits = [1200, 1350, 1100, 1500, 1700, 2300, 2100]\nfig, ax = plt.subplots(figsize=(7, 4))\nax.plot(days, visits, marker=\"o\")\nax.set_title(\"Website Visitors - Week 14\")\nax.set_xlabel(\"Day\")\nax.set_ylabel(\"Visitors\")\nfig.savefig(\"visits.png\", dpi=120, bbox_inches=\"tight\")\nprint(\"saved\")\n"
    },
    {
      "task": "Create a grouped bar chart comparing 2023 and 2024 sales for 4 regions (bars side by side).",
      "hint": "Use x = np.arange(4) and shift bars by +/- width/2.",
      "solution": "import matplotlib\nmatplotlib.use(\"Agg\")\nimport matplotlib.pyplot as plt\nimport numpy as np\n\nregions = [\"North\", \"South\", \"East\", \"West\"]\ns23 = [50, 42, 38, 45]\ns24 = [58, 47, 36, 52]\nx = np.arange(len(regions))\nw = 0.38\nfig, ax = plt.subplots()\nax.bar(x - w / 2, s23, w, label=\"2023\")\nax.bar(x + w / 2, s24, w, label=\"2024\")\nax.set_xticks(x, regions)\nax.legend()\nax.set_title(\"Sales by Region (Rs lakh)\")\nfig.savefig(\"grouped.png\")\nprint(\"saved\")\n"
    },
    {
      "task": "Generate 1,000 employee salaries with rng.normal(50000, 12000) and draw a histogram with 25 bins plus a vertical line at the mean.",
      "hint": "ax.hist(..., bins=25); ax.axvline(mean, color='red')",
      "solution": "import matplotlib\nmatplotlib.use(\"Agg\")\nimport matplotlib.pyplot as plt\nimport numpy as np\n\nrng = np.random.default_rng(1)\nsal = rng.normal(50000, 12000, 1000)\nfig, ax = plt.subplots()\nax.hist(sal, bins=25, edgecolor=\"white\")\nax.axvline(sal.mean(), color=\"red\", linestyle=\"--\", label=f\"Mean {sal.mean():,.0f}\")\nax.legend()\nfig.savefig(\"salary_hist.png\")\nprint(round(sal.mean()))\n"
    },
    {
      "task": "Make a scatter plot of advertising spend vs sales for 8 months, colour points by quarter, and add a straight trend line using np.polyfit.",
      "hint": "m, b = np.polyfit(x, y, 1); ax.plot(x, m*x + b)",
      "solution": "import matplotlib\nmatplotlib.use(\"Agg\")\nimport matplotlib.pyplot as plt\nimport numpy as np\n\nad = np.array([10, 15, 12, 20, 25, 30, 28, 35])\nsales = np.array([120, 150, 130, 190, 230, 270, 255, 310])\nquarter = [1, 1, 1, 2, 2, 2, 3, 3]\nm, b = np.polyfit(ad, sales, 1)\nfig, ax = plt.subplots()\nsc = ax.scatter(ad, sales, c=quarter, cmap=\"viridis\")\nax.plot(ad, m * ad + b, color=\"red\")\nax.set_xlabel(\"Ad spend (Rs thousand)\")\nax.set_ylabel(\"Sales (Rs thousand)\")\nfig.colorbar(sc, label=\"Quarter\")\nfig.savefig(\"scatter.png\")\nprint(round(m, 2), round(b, 2))\n"
    }
  ],
  "quiz": [
    {
      "question": "Which call creates a figure with 2 rows and 3 columns of charts?",
      "options": [
        "plt.figure(2, 3)",
        "plt.subplots(2, 3)",
        "plt.axes(2, 3)",
        "plt.grid(2, 3)"
      ],
      "answer": 1,
      "explanation": "plt.subplots(nrows, ncols) returns a figure and a 2x3 array of axes."
    },
    {
      "question": "Best chart to show the distribution of order values?",
      "options": [
        "Pie chart",
        "Line chart",
        "Histogram",
        "Stacked bar"
      ],
      "answer": 2,
      "explanation": "A histogram shows how values are distributed across bins."
    },
    {
      "question": "Which argument stacks a second bar series on the first?",
      "options": [
        "stack=True",
        "bottom=first_values",
        "top=first_values",
        "overlay=True"
      ],
      "answer": 1,
      "explanation": "bottom= sets the starting height of each bar."
    },
    {
      "question": "What does autopct='%1.1f%%' do in ax.pie?",
      "options": [
        "Rotates the pie",
        "Shows percentages with 1 decimal",
        "Explodes slices",
        "Adds a legend"
      ],
      "answer": 1,
      "explanation": "autopct formats the percentage label on each wedge."
    },
    {
      "question": "Which saves a chart without cutting off labels?",
      "options": [
        "savefig('c.png', crop=False)",
        "savefig('c.png', bbox_inches='tight')",
        "savefig('c.png', full=True)",
        "show(save=True)"
      ],
      "answer": 1,
      "explanation": "bbox_inches='tight' fits the saved image around all elements."
    },
    {
      "question": "df.plot(kind='barh') draws:",
      "options": [
        "A histogram",
        "A horizontal bar chart",
        "A box plot",
        "A heatmap"
      ],
      "answer": 1,
      "explanation": "barh is a horizontal bar chart."
    }
  ]
};
