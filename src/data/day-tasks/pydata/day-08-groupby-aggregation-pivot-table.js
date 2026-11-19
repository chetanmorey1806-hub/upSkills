export default {
  lesson: 'day-08-groupby-aggregation-pivot-table',
  minutes: 35,
  intro: 'Summarise data like a PivotTable: groupby with agg and named aggregations, transform for group-level columns, pivot_table, crosstab and melt.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'A `region` group has 5 rows and 2 of them have a missing `amount`. What do `count()` and `size()` return for that group\'s `amount`?',
      options: ['count = 5, size = 5', 'count = 3, size = 5', 'count = 5, size = 3', 'count = 3, size = 3'],
      answer: 1,
      explain: '`count()` counts **non-missing** values (3) while `size()` counts **rows** including NaN (5). `nunique()` counts distinct non-missing values. Mixing them up gives wrong "number of orders" figures in reports.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'You want a new column `share` = each order\'s amount ÷ its **region\'s** total, keeping every row. Which is right?',
      options: ['df["amount"] / df.groupby("region")["amount"].sum()', 'df["amount"] / df.groupby("region")["amount"].transform("sum")', 'df.groupby("region")["amount"].agg("sum") / df["amount"]', 'df.groupby("region").filter("sum")'],
      answer: 1,
      explain: '`transform("sum")` returns the group total **repeated for every row**, aligned to the original index, so the division works row by row. `.sum()` returns one row per region (a shorter Series indexed by region), which does not line up with the orders.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this print?',
      code: `import pandas as pd
df = pd.DataFrame({"region": ["N", "S", "N", "S", "N"],
                   "rep": ["A", "B", "A", "C", "D"],
                   "amount": [100, 250, 300, 50, 200]})
g = df.groupby("region")["amount"]
print(g.sum().to_dict())
print(g.mean().round(1).to_dict())
print(df.groupby("region")["rep"].nunique().to_dict())`,
      expected: "{'N': 600, 'S': 300}\n{'N': 200.0, 'S': 150.0}\n{'N': 2, 'S': 2}",
      explain: 'groupby splits rows by region, applies the function to each group and combines the results into a Series indexed by region. North has reps A, A, D → 2 unique; South has B, C → 2.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'Build a **region report** `report` from `sales` using `groupby("region")` and **named aggregation** with these columns:\n- `revenue`: sum of `amount`\n- `orders`: number of orders (count of `order_id`)\n- `avg_order`: mean of `amount`\n\nThen sort it by `revenue` from high to low and turn `region` back into a normal column (`reset_index`).',
      example: { title: 'named aggregation', code: 'marks.groupby("class").agg(\n    top=("score", "max"),\n    students=("roll", "count"),\n).reset_index()' },
      starter: 'import pandas as pd\nsales = pd.DataFrame({\n    "order_id": [1, 2, 3, 4, 5, 6, 7],\n    "region": ["West", "North", "West", "South", "North", "West", "South"],\n    "amount": [1200, 800, 450, 2300, 1700, 650, 300],\n})\n\n# TODO: report = ...\n',
      solution: 'import pandas as pd\nsales = pd.DataFrame({\n    "order_id": [1, 2, 3, 4, 5, 6, 7],\n    "region": ["West", "North", "West", "South", "North", "West", "South"],\n    "amount": [1200, 800, 450, 2300, 1700, 650, 300],\n})\n\nreport = (sales.groupby("region")\n          .agg(revenue=("amount", "sum"), orders=("order_id", "count"), avg_order=("amount", "mean"))\n          .sort_values("revenue", ascending=False)\n          .reset_index())\n',
      tests: [
        { call: 'list(report.columns)', expect: ['region', 'revenue', 'orders', 'avg_order'] },
        { call: 'report["region"].tolist()', expect: ['South', 'North', 'West'] },
        { call: '[int(x) for x in report["revenue"]]', expect: [2600, 2500, 2300] },
        { call: '[int(x) for x in report["orders"]]', expect: [2, 2, 3] },
        { call: '[round(float(x), 2) for x in report["avg_order"]] == [1300.0, 1250.0, 766.67]', expect: true, msg: 'avg_order must be [1300.0, 1250.0, 766.67] (mean amount per region)' },
      ],
      explain: 'Named aggregation `new_col=("source_col", "func")` gives clean column names in one step. Without `reset_index()` the region stays in the index. Note West has the most orders but the lowest revenue – exactly the kind of insight a grouped report reveals.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Create `pt`, a **pivot table** of total `amount` with `city` as rows and `category` as columns, missing combinations filled with **0** and a **Total** row/column (`margins=True, margins_name="Total"`).\nThen set `pune_elec` to the Pune / Electronics value and `grand` to the grand total (both int).',
      example: { title: 'pivot_table', code: 'pd.pivot_table(df, values="marks", index="class",\n               columns="subject", aggfunc="mean",\n               fill_value=0, margins=True)' },
      starter: 'import pandas as pd\ndf = pd.DataFrame({\n    "city": ["Pune", "Pune", "Delhi", "Delhi", "Pune", "Chennai"],\n    "category": ["Electronics", "Grocery", "Electronics", "Electronics", "Electronics", "Grocery"],\n    "amount": [5000, 800, 4200, 3100, 2500, 950],\n})\n\n# TODO: pt, pune_elec, grand\n',
      solution: 'import pandas as pd\ndf = pd.DataFrame({\n    "city": ["Pune", "Pune", "Delhi", "Delhi", "Pune", "Chennai"],\n    "category": ["Electronics", "Grocery", "Electronics", "Electronics", "Electronics", "Grocery"],\n    "amount": [5000, 800, 4200, 3100, 2500, 950],\n})\n\npt = pd.pivot_table(df, values="amount", index="city", columns="category",\n                    aggfunc="sum", fill_value=0, margins=True, margins_name="Total")\npune_elec = int(pt.loc["Pune", "Electronics"])\ngrand = int(pt.loc["Total", "Total"])\n',
      tests: [
        { call: 'sorted(pt.index.tolist())', expect: ['Chennai', 'Delhi', 'Pune', 'Total'] },
        { call: 'int(pt.loc["Chennai", "Electronics"])', expect: 0, msg: 'missing combinations must be 0 (fill_value=0)' },
        { call: '[int(pune_elec), int(grand)]', expect: [7500, 16550] },
        { call: 'int(pt.loc["Delhi", "Total"])', expect: 7300 },
      ],
      explain: '`pivot_table` = Excel PivotTable: `index` → rows, `columns` → columns, `values` + `aggfunc` → what to compute. The default aggfunc is **mean**, so forgetting `aggfunc="sum"` is a classic mistake. `fill_value=0` replaces NaN for empty combinations and `margins=True` adds totals.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'A wide table has columns `store, Jan, Feb, Mar`. Complete the call that turns it into a long table with columns `store, month, sales`:\n\n`long = wide.____(id_vars="store", var_name="month", value_name="sales")`',
      accept: ['melt'],
      explain: '`melt` converts **wide → long** (one row per store-month), which is the tidy format groupby and Seaborn prefer. The reverse (long → wide) is `pivot` / `pivot_table` or `unstack`.',
    },
  ],
};
