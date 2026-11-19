export default {
  lesson: 'day-11-apply-map-vectorization-performance',
  minutes: 30,
  intro: 'Translate values with map, use apply when you must, replace row loops with vectorised np.where / np.select, bin numbers with cut and qcut, and save memory with category.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What does this print? (note what happens to a code that is not in the dict)',
      code: `import pandas as pd
codes = pd.Series(["MH", "DL", "KA", "GJ"])
names = {"MH": "Maharashtra", "DL": "Delhi", "KA": "Karnataka"}
print(codes.map(names).tolist())
print(codes.replace(names).tolist())`,
      expected: "['Maharashtra', 'Delhi', 'Karnataka', nan]\n['Maharashtra', 'Delhi', 'Karnataka', 'GJ']",
      explain: '`map(dict)` is a lookup: values missing from the dict become **NaN**. `replace(dict)` only changes the values it finds and leaves the rest as they are. Choose `map` when every value must be translated (and check for NaN afterwards).',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'You need `bonus` = 10% of salary for rating ≥ 4, else 5%, on 2 lakh rows. Which is the **fastest** correct approach?',
      options: ['for i, row in df.iterrows(): ...', 'df.apply(lambda r: r.salary * (0.10 if r.rating >= 4 else 0.05), axis=1)', 'df["salary"] * np.where(df["rating"] >= 4, 0.10, 0.05)', 'df["salary"].map(lambda s: s * 0.10)'],
      answer: 2,
      explain: 'Vectorised `np.where` works on whole columns in C and is typically 50-100× faster than `apply(axis=1)`, which calls a Python function once per row (and `iterrows` is even slower). Option D ignores the rating completely.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these reduce memory or speed up pandas code? (choose all that apply)',
      options: ['Convert a low-cardinality text column (e.g. 5 cities in 1 lakh rows) to `category`', 'Downcast numbers: `pd.to_numeric(s, downcast="integer")`', 'Use `iterrows()` instead of vectorised arithmetic', 'Use `.str` / `.dt` accessors instead of `apply` with string functions', 'Load only needed columns with `usecols`'],
      answers: [0, 1, 3, 4],
      explain: 'Category stores each distinct label once plus small integer codes; downcasting shrinks int64 → int8/16/32; accessors and vectorised operations avoid Python loops; `usecols` avoids loading unused data. `iterrows` is the slowest option in pandas.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'For the `emp` DataFrame add three columns **without loops or apply(axis=1)**:\n1. `dept_name`: map the `dept` code with `{"D1": "Sales", "D2": "IT", "D3": "HR"}`\n2. `bonus`: 10% of salary when `rating >= 4`, otherwise 5% (`np.where`)\n3. `band`: with `np.select` – `"A"` if salary ≥ 80000, `"B"` if salary ≥ 50000, else `"C"`',
      example: { title: 'np.select with several conditions', code: 'conds = [df.marks >= 75, df.marks >= 40]\nchoices = ["Distinction", "Pass"]\ndf["result"] = np.select(conds, choices, default="Fail")' },
      starter: 'import pandas as pd\nimport numpy as np\nemp = pd.DataFrame({\n    "name": ["Asha", "Ravi", "Neha", "Karan"],\n    "dept": ["D1", "D2", "D2", "D3"],\n    "salary": [45000, 82000, 61000, 50000],\n    "rating": [4, 3, 5, 2],\n})\n\n# TODO: dept_name, bonus, band\n',
      solution: 'import pandas as pd\nimport numpy as np\nemp = pd.DataFrame({\n    "name": ["Asha", "Ravi", "Neha", "Karan"],\n    "dept": ["D1", "D2", "D2", "D3"],\n    "salary": [45000, 82000, 61000, 50000],\n    "rating": [4, 3, 5, 2],\n})\n\nemp["dept_name"] = emp["dept"].map({"D1": "Sales", "D2": "IT", "D3": "HR"})\nemp["bonus"] = emp["salary"] * np.where(emp["rating"] >= 4, 0.10, 0.05)\nemp["band"] = np.select([emp["salary"] >= 80000, emp["salary"] >= 50000], ["A", "B"], default="C")\n',
      tests: [
        { call: 'emp["dept_name"].tolist()', expect: ['Sales', 'IT', 'IT', 'HR'] },
        { call: '[int(round(float(x))) for x in emp["bonus"]]', expect: [4500, 4100, 6100, 2500] },
        { call: '[str(x) for x in emp["band"]]', expect: ['C', 'A', 'B', 'B'] },
      ],
      explain: '`np.select` checks the conditions **in order** and uses the first True, so put the strictest condition (≥ 80000) first – otherwise 82000 would match "≥ 50000" and become "B". 50000 itself is "B" because the condition is ≥.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: '**Binning.** For the customers\' yearly `spend`:\n1. `segment`: use `pd.cut` with bins `[0, 5000, 20000, inf]` and labels `["Low", "Medium", "High"]`\n2. `seg_counts`: a dict `{label: count}` of `segment` (use `value_counts()`)\n3. `quartile`: use `pd.qcut(spend, 4, labels=["Q1", "Q2", "Q3", "Q4"])` (equal-sized groups)',
      example: { title: 'cut vs qcut', code: 'pd.cut(age, bins=[0, 18, 60, 120], labels=["Child", "Adult", "Senior"])\npd.qcut(income, 3, labels=["Bottom", "Middle", "Top"])' },
      starter: 'import pandas as pd\nimport numpy as np\nspend = pd.Series([1200, 4800, 5000, 7600, 15000, 20000, 26000, 52000])\n\n# TODO: segment, seg_counts, quartile\n',
      solution: 'import pandas as pd\nimport numpy as np\nspend = pd.Series([1200, 4800, 5000, 7600, 15000, 20000, 26000, 52000])\n\nsegment = pd.cut(spend, bins=[0, 5000, 20000, np.inf], labels=["Low", "Medium", "High"])\nseg_counts = segment.value_counts().to_dict()\nquartile = pd.qcut(spend, 4, labels=["Q1", "Q2", "Q3", "Q4"])\n',
      tests: [
        { call: '[str(x) for x in segment]', expect: ['Low', 'Low', 'Low', 'Medium', 'Medium', 'Medium', 'High', 'High'] },
        { call: '{str(k): int(v) for k, v in seg_counts.items()}', expect: { Low: 3, Medium: 3, High: 2 } },
        { call: '[str(x) for x in quartile]', expect: ['Q1', 'Q1', 'Q2', 'Q2', 'Q3', 'Q3', 'Q4', 'Q4'] },
      ],
      explain: '`cut` uses **fixed** edges you choose; bins are right-inclusive by default, so 5000 falls in (0, 5000] = Low and 20000 in Medium. `qcut` uses **quantiles**, so each group gets (about) the same number of customers – good for "top 25% customers".',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the line that converts the `city` column to the memory-saving categorical dtype:\n\n`df["city"] = df["city"].astype(____)`',
      accept: ['"category"', "'category'", 'pd.CategoricalDtype()'],
      explain: '`astype("category")` stores each city name once and keeps small integer codes per row. Check the saving with `df.memory_usage(deep=True)`. It helps when the number of distinct values is small compared to the number of rows.',
    },
  ],
};
