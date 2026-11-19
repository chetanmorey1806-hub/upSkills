export default {
  lesson: 'day-07-data-cleaning-missing-duplicates-outliers',
  minutes: 35,
  intro: 'Clean messy data: find and fill missing values, drop duplicates, fix dtypes, standardise text and cap outliers with the IQR rule.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which line shows **how many missing values each column has**?',
      options: ['df.isna()', 'df.isna().sum()', 'df.count()', 'df.dropna().sum()'],
      answer: 1,
      explain: '`isna()` returns a True/False table; `.sum()` counts the Trues per column. `df.count()` counts the **non-missing** values, which you would have to subtract from `len(df)`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about cleaning are TRUE? (choose all that apply)',
      options: ['`pd.to_numeric(s, errors="coerce")` turns values like "N/A" into NaN', 'The median is a safer fill value than the mean when a column has outliers', '`drop_duplicates(subset=["order_id"], keep="first")` keeps the first copy of each order', '`df["city"].str.strip().str.title()` turns " pune " into "Pune"', '`fillna(0)` is always the right way to handle a missing price'],
      answers: [0, 1, 2, 3],
      explain: 'Filling a missing price with 0 silently pulls averages down – choose the fill based on meaning (median, group median, forward fill) or drop the row. `errors="coerce"` converts bad text to NaN so you can count and handle it.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this print?',
      code: `import pandas as pd
s = pd.Series([" pune", "PUNE ", "Delhi", "delhi", None])
clean = s.str.strip().str.title()
print(clean.nunique())
print(clean.isna().sum())
print(clean.value_counts().to_dict())`,
      expected: "2\n1\n{'Pune': 2, 'Delhi': 2}",
      explain: 'After `strip()` + `title()` the four spellings become two cities. `nunique()` ignores NaN by default and `None` stays missing (string methods return NaN for missing values), so `isna().sum()` is 1.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'Clean the `raw` orders table and store the result in `df`:\n1. remove exact duplicate rows\n2. convert `amount` to numbers (`"N/A"` becomes NaN) with `pd.to_numeric(..., errors="coerce")`\n3. fill missing `amount` with the **median of its city** (`groupby("city")["amount"].transform("median")`)\n4. make `city` clean: strip spaces and Title Case\n5. reset the index (`drop=True`)\n\nDo step 4 **before** step 3 so that " pune" and "Pune" are the same city.',
      example: { title: 'group-wise fill', code: 'df["marks"] = df["marks"].fillna(\n    df.groupby("class")["marks"].transform("median"))' },
      starter: 'import pandas as pd\nraw = pd.DataFrame({\n    "order_id": [1, 2, 2, 3, 4, 5, 6],\n    "city": ["Pune", " pune", " pune", "Delhi", "delhi ", "Delhi", "Pune"],\n    "amount": ["1200", "800", "800", "N/A", "500", "700", None],\n})\n\n# TODO: df = cleaned copy of raw\n',
      solution: 'import pandas as pd\nraw = pd.DataFrame({\n    "order_id": [1, 2, 2, 3, 4, 5, 6],\n    "city": ["Pune", " pune", " pune", "Delhi", "delhi ", "Delhi", "Pune"],\n    "amount": ["1200", "800", "800", "N/A", "500", "700", None],\n})\n\ndf = raw.drop_duplicates().copy()\ndf["amount"] = pd.to_numeric(df["amount"], errors="coerce")\ndf["city"] = df["city"].str.strip().str.title()\ndf["amount"] = df["amount"].fillna(df.groupby("city")["amount"].transform("median"))\ndf = df.reset_index(drop=True)\n',
      tests: [
        { call: 'len(df)', expect: 6, msg: 'the duplicate order 2 must be removed' },
        { call: 'df["city"].tolist()', expect: ['Pune', 'Pune', 'Delhi', 'Delhi', 'Delhi', 'Pune'] },
        { call: '[int(x) for x in df["amount"]]', expect: [1200, 800, 600, 500, 700, 1000] },
        { call: 'int(df["amount"].isna().sum())', expect: 0 },
        { call: 'df.index.tolist()', expect: [0, 1, 2, 3, 4, 5] },
      ],
      explain: 'Order matters: duplicates first, then types (text "N/A" → NaN), then text cleaning, then the fill – otherwise " pune" would be its own group. Delhi\'s median of 500 and 700 is 600 and Pune\'s median of 1200 and 800 is 1000. Using `transform` returns a value for **every row**, aligned with the original index.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: '**Outliers with the IQR rule.** For the `bill` Series:\n1. `q1`, `q3`: the 25th and 75th percentiles (`quantile`)\n2. `upper`: `q3 + 1.5 * (q3 - q1)` and `lower`: `q1 - 1.5 * (q3 - q1)`\n3. `outliers`: the values outside `[lower, upper]`\n4. `capped`: `bill` with values clipped to `[lower, upper]` (`clip`)',
      example: { title: 'IQR fences', code: 'q1, q3 = s.quantile(0.25), s.quantile(0.75)\niqr = q3 - q1\nmask = (s < q1 - 1.5 * iqr) | (s > q3 + 1.5 * iqr)' },
      starter: 'import pandas as pd\nbill = pd.Series([420, 380, 510, 465, 390, 4800, 440, 505, 60, 470])\n\n# TODO: q1, q3, lower, upper, outliers, capped\n',
      solution: 'import pandas as pd\nbill = pd.Series([420, 380, 510, 465, 390, 4800, 440, 505, 60, 470])\n\nq1 = bill.quantile(0.25)\nq3 = bill.quantile(0.75)\niqr = q3 - q1\nlower = q1 - 1.5 * iqr\nupper = q3 + 1.5 * iqr\noutliers = bill[(bill < lower) | (bill > upper)]\ncapped = bill.clip(lower, upper)\n',
      tests: [
        { call: '[round(float(q1), 2), round(float(q3), 2)]', expect: [397.5, 496.25] },
        { call: '[round(float(lower), 2), round(float(upper), 2)]', expect: [249.38, 644.38] },
        { call: 'sorted(int(x) for x in outliers)', expect: [60, 4800] },
        { call: '[round(float(capped.iloc[5]), 2), round(float(capped.iloc[8]), 2)]', expect: [644.38, 249.38], msg: 'the outliers must be clipped to the fences' },
        { call: '[int(x) for i, x in enumerate(capped) if i not in (5, 8)]', expect: [420, 380, 510, 465, 390, 440, 505, 470], msg: 'normal values must stay unchanged' },
      ],
      explain: 'Values beyond 1.5 × IQR from the quartiles are treated as outliers (here the ₹60 test bill and the ₹4800 bulk order). Capping with `clip` keeps the row but limits its effect on the mean – useful when the record is real but extreme. Remember the fences use the **IQR**, not the standard deviation (that is the z-score method).',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the call that keeps the **last** entry when the same `email` appears more than once:\n\n`df = df.drop_duplicates(subset=["email"], keep=____)`',
      accept: ['"last"', "'last'"],
      explain: '`keep="first"` (default) keeps the first occurrence, `keep="last"` the last (e.g. the most recent sign-up), and `keep=False` drops **all** copies. `df.duplicated(subset=...).sum()` counts how many rows would be removed.',
    },
  ],
};
