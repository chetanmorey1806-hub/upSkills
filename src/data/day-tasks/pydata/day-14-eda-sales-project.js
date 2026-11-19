export default {
  lesson: 'day-14-eda-sales-project',
  minutes: 40,
  intro: 'Run a mini EDA on sales data: profile it, compute KPIs (revenue, AOV, return rate), compare segments, and do a Pareto/ABC analysis.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What is **AOV (Average Order Value)**?',
      options: ['Total revenue ÷ number of customers', 'Total revenue ÷ number of orders', 'Average price of all products in the catalogue', 'Revenue of the largest order'],
      answer: 1,
      explain: 'AOV = revenue ÷ **orders** (count distinct order IDs if one order has several rows). Revenue ÷ customers is *revenue per customer*, a different KPI. Dividing by the number of rows when an order has many line items is a common mistake.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these belong in the **profiling** step of EDA (before cleaning)? (choose all that apply)',
      options: ['Count missing values per column', 'Check for duplicate order IDs', 'Look at min/max for impossible values (negative qty, future dates)', 'Write the final recommendations slide', 'Check dtypes (dates or numbers stored as text)'],
      answers: [0, 1, 2, 4],
      explain: 'Profiling documents data-quality issues **first** so your KPIs are trustworthy. Recommendations come at the end, after analysis and visualisation, and must be backed by the numbers you computed.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 10,
      q: 'Compute the headline **KPIs** from `sales` (one row per order; `returned` is "Y"/"N"). Store them in a dict `kpi` with keys:\n- `"revenue"`: total of `amount` for orders that were **not returned** (int)\n- `"orders"`: number of distinct `order_id`s (all orders)\n- `"aov"`: revenue ÷ number of **not-returned** orders, rounded to 2 decimals\n- `"return_rate"`: % of orders returned, rounded to 1 decimal',
      example: { title: 'KPI dict', code: 'kept = df[df["status"] == "Delivered"]\nkpi = {\n    "revenue": int(kept["amount"].sum()),\n    "orders": df["order_id"].nunique(),\n}' },
      starter: 'import pandas as pd\nsales = pd.DataFrame({\n    "order_id": [101, 102, 103, 104, 105, 106, 107, 108],\n    "city": ["Pune", "Delhi", "Pune", "Mumbai", "Delhi", "Pune", "Mumbai", "Delhi"],\n    "amount": [1255, 3400, 560, 2100, 980, 4300, 760, 1800],\n    "returned": ["N", "N", "Y", "N", "N", "N", "Y", "N"],\n})\n\nkpi = {}\n# TODO\n',
      solution: 'import pandas as pd\nsales = pd.DataFrame({\n    "order_id": [101, 102, 103, 104, 105, 106, 107, 108],\n    "city": ["Pune", "Delhi", "Pune", "Mumbai", "Delhi", "Pune", "Mumbai", "Delhi"],\n    "amount": [1255, 3400, 560, 2100, 980, 4300, 760, 1800],\n    "returned": ["N", "N", "Y", "N", "N", "N", "Y", "N"],\n})\n\nkept = sales[sales["returned"] == "N"]\nkpi = {\n    "revenue": int(kept["amount"].sum()),\n    "orders": int(sales["order_id"].nunique()),\n    "aov": round(kept["amount"].sum() / kept["order_id"].nunique(), 2),\n    "return_rate": round((sales["returned"] == "Y").mean() * 100, 1),\n}\n',
      tests: [
        { call: 'int(kpi["revenue"])', expect: 13835 },
        { call: 'int(kpi["orders"])', expect: 8 },
        { call: 'round(float(kpi["aov"]), 2)', expect: 2305.83 },
        { call: 'round(float(kpi["return_rate"]), 1) == 25.0', expect: true, msg: 'return_rate must be 25.0 (2 of 8 orders returned)' },
      ],
      explain: 'Decide the definition first and write it down: here revenue excludes returns, and AOV uses the same filtered orders. `(col == "Y").mean()` is a neat trick – the mean of True/False is the share of Trues.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 10,
      q: '**Pareto / ABC analysis.** For `prod` (revenue per product):\n1. sort by revenue, highest first\n2. add `cum_pct` = cumulative revenue share in %, rounded to 1 decimal\n3. add `abc`: `"A"` if `cum_pct <= 80`, `"B"` if `cum_pct <= 95`, else `"C"`\n4. `a_products`: list of product names in class A\n\nKeep the result in `prod`.',
      example: { title: 'cumulative share', code: 'df = df.sort_values("sales", ascending=False)\ndf["cum_pct"] = df["sales"].cumsum() / df["sales"].sum() * 100' },
      starter: 'import pandas as pd\nimport numpy as np\nprod = pd.DataFrame({\n    "product": ["Phone", "Cable", "Laptop", "Mouse", "Charger", "Tablet", "Cover"],\n    "revenue": [42000, 1500, 65000, 3200, 4800, 21000, 2500],\n})\n\n# TODO\n',
      solution: 'import pandas as pd\nimport numpy as np\nprod = pd.DataFrame({\n    "product": ["Phone", "Cable", "Laptop", "Mouse", "Charger", "Tablet", "Cover"],\n    "revenue": [42000, 1500, 65000, 3200, 4800, 21000, 2500],\n})\n\nprod = prod.sort_values("revenue", ascending=False).reset_index(drop=True)\nprod["cum_pct"] = (prod["revenue"].cumsum() / prod["revenue"].sum() * 100).round(1)\nprod["abc"] = np.select([prod["cum_pct"] <= 80, prod["cum_pct"] <= 95], ["A", "B"], default="C")\na_products = prod.loc[prod["abc"] == "A", "product"].tolist()\n',
      tests: [
        { call: 'prod["product"].tolist()', expect: ['Laptop', 'Phone', 'Tablet', 'Charger', 'Mouse', 'Cover', 'Cable'] },
        { call: '[round(float(x), 1) for x in prod["cum_pct"]][:3]', expect: [46.4, 76.4, 91.4] },
        { call: '[str(x) for x in prod["abc"]]', expect: ['A', 'A', 'B', 'B', 'C', 'C', 'C'] },
        { call: 'list(a_products)', expect: ['Laptop', 'Phone'] },
      ],
      explain: 'Pareto: a few products usually bring most of the revenue. Sorting **descending** before `cumsum` is essential – otherwise the cumulative share is meaningless. Class A items deserve the most stock and marketing attention; class C items are candidates for review.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'A quick **bivariate** check: does discount increase order size? What does this print?',
      code: `import pandas as pd
df = pd.DataFrame({"discount": ["Yes", "No", "Yes", "No", "Yes", "No"],
                   "amount": [1800, 1200, 2000, 1000, 1600, 1400]})
g = df.groupby("discount")["amount"].mean()
print(g.to_dict())
print(round((g["Yes"] - g["No"]) / g["No"] * 100, 1))`,
      expected: "{'No': 1200.0, 'Yes': 1800.0}\n50.0",
      explain: 'Grouping a numeric column by a category is the basic bivariate comparison. Discounted orders are 50% larger on average here – but correlation is not causation, so in the insight you would say "associated with", and check the sample size.',
    },
    {
      type: 'written',
      mins: 4,
      q: 'Write **one insight** (2-3 sentences) for a manager from this finding: *"Pune gives 45% of revenue but has the highest return rate (18% vs 9% overall)."* Mention the **number**, the **impact** and one **recommended action**.',
      rules: [
        { regex: '\\d', msg: 'Include at least one number from the finding' },
        { any: ['return', 'returns'], msg: 'Mention the returns problem' },
        { any: ['recommend', 'should', 'suggest', 'action', 'investigate', 'review', 'reduce', 'check'], msg: 'Give a recommended action (e.g. "we should…", "recommend…")' },
      ],
      minWords: 20,
      maxWords: 90,
      sample: 'Pune is our biggest market with 45% of revenue, but its return rate of 18% is double the 9% average, so we lose a large share of that revenue to returns. I recommend we review the top returned products and courier partner in Pune and fix the main return reason first.',
      explain: 'A good insight = **what** (fact with numbers) + **so what** (business impact) + **now what** (action). Avoid vague lines like "Pune has interesting patterns". Managers act on specific, quantified statements.',
    },
  ],
};
