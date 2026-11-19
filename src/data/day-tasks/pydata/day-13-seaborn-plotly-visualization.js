export default {
  lesson: 'day-13-seaborn-plotly-visualization',
  minutes: 30,
  intro: 'Choose the right Seaborn plot, understand what it computes (counts, means, correlations, pivots) and prepare tidy data for hue, heatmaps and Plotly Express.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: '`sns.barplot(data=df, x="city", y="amount")` – what does the height of each bar show by default?',
      options: ['The total (sum) of amount per city', 'The mean of amount per city, with an error bar', 'The number of rows per city', 'The largest amount per city'],
      answer: 1,
      explain: 'Seaborn\'s `barplot` is a **statistical** plot: the default `estimator` is the **mean**, with a confidence-interval error bar. For totals pass `estimator=sum` (or aggregate yourself). Counting rows is `countplot`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Match the goal to the right Seaborn function. Which pairs are correct? (choose all that apply)',
      options: ['Distribution of order values → `sns.histplot` / `sns.kdeplot`', 'Compare salary spread across departments → `sns.boxplot`', 'Correlation matrix of numeric columns → `sns.heatmap(df.corr(numeric_only=True), annot=True)`', 'Number of orders per payment mode → `sns.countplot`', 'Trend of daily sales → `sns.pairplot`'],
      answers: [0, 1, 2, 3],
      explain: 'A trend over time is a `lineplot`. `pairplot` draws scatter plots for **every pair** of numeric columns (plus histograms on the diagonal) – a quick EDA overview of relationships, not a time trend.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Before drawing a correlation heatmap, compute the numbers yourself.\n1. `corr`: the correlation matrix of the numeric columns of `df` (`df.corr(numeric_only=True)`)\n2. `ad_sales`: the correlation between `ad_spend` and `sales`, rounded to 2 decimals\n3. `strongest`: the name of the column (other than `sales`) with the **largest absolute** correlation with `sales`',
      example: { title: 'reading one correlation', code: 'c = df.corr(numeric_only=True)\nc.loc["study_hours", "marks"]          # one number between -1 and 1\nc["marks"].drop("marks").abs().idxmax()  # most related column' },
      starter: 'import pandas as pd\ndf = pd.DataFrame({\n    "ad_spend": [10, 15, 12, 20, 25, 30, 28],\n    "discount": [5, 3, 6, 2, 4, 1, 3],\n    "temperature": [30, 32, 29, 35, 31, 33, 30],\n    "sales": [120, 180, 135, 170, 230, 240, 255],\n    "city": ["Pune", "Pune", "Delhi", "Delhi", "Pune", "Delhi", "Pune"],\n})\n\n# TODO: corr, ad_sales, strongest\n',
      solution: 'import pandas as pd\ndf = pd.DataFrame({\n    "ad_spend": [10, 15, 12, 20, 25, 30, 28],\n    "discount": [5, 3, 6, 2, 4, 1, 3],\n    "temperature": [30, 32, 29, 35, 31, 33, 30],\n    "sales": [120, 180, 135, 170, 230, 240, 255],\n    "city": ["Pune", "Pune", "Delhi", "Delhi", "Pune", "Delhi", "Pune"],\n})\n\ncorr = df.corr(numeric_only=True)\nad_sales = round(corr.loc["ad_spend", "sales"], 2)\nstrongest = corr["sales"].drop("sales").abs().idxmax()\n',
      tests: [
        { call: 'sorted(corr.columns.tolist())', expect: ['ad_spend', 'discount', 'sales', 'temperature'], msg: 'only numeric columns in corr' },
        { call: 'round(float(ad_sales), 2)', expect: 0.96 },
        { call: 'strongest', expect: 'ad_spend' },
      ],
      explain: '`numeric_only=True` skips text columns like `city` (newer pandas raises an error otherwise). A heatmap is just this matrix coloured; reading the numbers first tells you what to highlight. Use `abs()` because a strong **negative** correlation (e.g. discount) is just as important as a positive one.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: '**Tidy data for `hue`.** Seaborn and Plotly Express want **long** data. Convert `wide` (one column per year) into `long` with columns `city`, `year`, `sales` (`melt`), so you could call `sns.barplot(data=long, x="city", y="sales", hue="year")`.\nThen `pivot`: turn `long` back into a city × year table with `pivot_table(index="city", columns="year", values="sales")` – the input of `sns.heatmap(pivot, annot=True)`.',
      example: { title: 'melt for hue', code: 'long = scores.melt(id_vars="student", var_name="subject", value_name="marks")\nsns.barplot(data=long, x="student", y="marks", hue="subject")' },
      starter: 'import pandas as pd\nwide = pd.DataFrame({\n    "city": ["Pune", "Delhi", "Chennai"],\n    "2023": [410, 520, 300],\n    "2024": [460, 505, 355],\n})\n\n# TODO: long, pivot\n',
      solution: 'import pandas as pd\nwide = pd.DataFrame({\n    "city": ["Pune", "Delhi", "Chennai"],\n    "2023": [410, 520, 300],\n    "2024": [460, 505, 355],\n})\n\nlong = wide.melt(id_vars="city", var_name="year", value_name="sales")\npivot = long.pivot_table(index="city", columns="year", values="sales")\n',
      tests: [
        { call: 'sorted(long.columns.tolist())', expect: ['city', 'sales', 'year'] },
        { call: 'len(long)', expect: 6 },
        { call: 'int(long.loc[(long["city"] == "Delhi") & (long["year"] == "2024"), "sales"].iloc[0])', expect: 505 },
        { call: '[list(pivot.shape), int(pivot.loc["Chennai", "2024"])]', expect: [[3, 2], 355] },
      ],
      explain: 'Long (tidy) data has one row per observation, so a single column (`year`) can drive the colour (`hue`), facets (`col=`) or a Plotly `color=` argument. Heatmaps need the opposite: a wide matrix, which `pivot_table` builds.',
    },
    {
      type: 'output',
      mins: 3,
      q: '`sns.countplot(data=df, x="payment")` draws one bar per payment mode. This code computes the same bar heights. What does it print?',
      code: `import pandas as pd
df = pd.DataFrame({"payment": ["UPI", "Card", "UPI", "COD", "UPI", "Card"]})
counts = df["payment"].value_counts()
print(counts.to_dict())
print(counts.idxmax(), round(counts.max() / counts.sum() * 100))`,
      expected: "{'UPI': 3, 'Card': 2, 'COD': 1}\nUPI 50",
      explain: '`countplot` = `value_counts()` drawn as bars. UPI appears 3 times out of 6 rows → 50%. Use `order=df["payment"].value_counts().index` in countplot to sort the bars by frequency.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the Plotly Express call that saves an interactive chart `fig` as a web page:\n\n`fig.____("sales_chart.html")`',
      accept: ['write_html'],
      explain: '`fig.write_html("file.html")` saves a standalone interactive page (hover, zoom) you can email or host. `fig.show()` displays it in the notebook. Static images need `fig.write_image` and the kaleido package.',
    },
  ],
};
