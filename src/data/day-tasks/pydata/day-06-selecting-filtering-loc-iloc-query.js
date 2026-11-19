export default {
  lesson: 'day-06-selecting-filtering-loc-iloc-query',
  minutes: 30,
  intro: 'Select rows and columns with loc and iloc, filter with combined conditions, isin, between, str.contains and query, and update values safely with loc.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'The index labels are 10, 20, 30, 40. What does this print? (watch the different slice rules)',
      code: `import pandas as pd
df = pd.DataFrame({"item": ["Pen", "Book", "Bag", "Lamp"],
                   "price": [10, 250, 900, 450]}, index=[10, 20, 30, 40])
print(len(df.loc[10:30]))
print(len(df.iloc[0:3]))
print(df.loc[30, "item"])
print(df.iloc[-1, 1])`,
      expected: '3\n3\nBag\n450',
      explain: '`loc` uses **labels** and its slices **include** the end label (10, 20, 30 → 3 rows). `iloc` uses **positions** and excludes the end (positions 0, 1, 2 → 3 rows). `df.loc[30, "item"]` = row label 30, column "item"; `iloc[-1, 1]` = last row, second column.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Which line correctly keeps orders from **Pune with amount > 1000**?',
      options: ['df[df.city == "Pune" and df.amount > 1000]', 'df[(df.city == "Pune") & (df.amount > 1000)]', 'df[df.city == "Pune" & df.amount > 1000]', 'df.loc["Pune", > 1000]'],
      answer: 1,
      explain: 'pandas combines boolean Series with `&`, `|`, `~` and every condition must be in brackets (operator precedence). Python `and` raises *"The truth value of a Series is ambiguous"*; without brackets `"Pune" & df.amount` is evaluated first and fails.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the `query` that keeps rows whose `amount` is greater than the Python variable `limit`:\n\n`df.query("amount > ____")`',
      accept: ['@limit'],
      explain: 'Inside `query()` you refer to a Python variable with `@`: `df.query("amount > @limit")`. Column names are used directly; string values need quotes inside the query, e.g. `df.query("city == \'Pune\'")`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'Using the `orders` DataFrame in the starter, create:\n1. `metro`: orders whose city is **Mumbai, Delhi or Bengaluru** (`isin`)\n2. `mid`: orders with amount **between 500 and 1500 inclusive** (`between`)\n3. `phones`: orders whose product **contains "phone"** (case-insensitive)\n4. `top2`: the 2 orders with the largest amount (`nlargest`)\n\nKeep all columns in each result.',
      example: { title: 'isin, between, str.contains', code: 'students[students["grade"].isin(["A", "B"])]\nstudents[students["marks"].between(40, 60)]\nstudents[students["name"].str.contains("sh", case=False)]\nstudents.nlargest(3, "marks")' },
      starter: 'import pandas as pd\norders = pd.DataFrame({\n    "order_id": [1, 2, 3, 4, 5, 6],\n    "city": ["Mumbai", "Pune", "Delhi", "Jaipur", "Bengaluru", "Delhi"],\n    "product": ["iPhone 15", "Laptop", "Headphones", "Mouse", "Phone Case", "Monitor"],\n    "amount": [79000, 52000, 1200, 450, 499, 9800],\n})\n\n# TODO: metro, mid, phones, top2\n',
      solution: 'import pandas as pd\norders = pd.DataFrame({\n    "order_id": [1, 2, 3, 4, 5, 6],\n    "city": ["Mumbai", "Pune", "Delhi", "Jaipur", "Bengaluru", "Delhi"],\n    "product": ["iPhone 15", "Laptop", "Headphones", "Mouse", "Phone Case", "Monitor"],\n    "amount": [79000, 52000, 1200, 450, 499, 9800],\n})\n\nmetro = orders[orders["city"].isin(["Mumbai", "Delhi", "Bengaluru"])]\nmid = orders[orders["amount"].between(500, 1500)]\nphones = orders[orders["product"].str.contains("phone", case=False)]\ntop2 = orders.nlargest(2, "amount")\n',
      tests: [
        { call: 'sorted(int(x) for x in metro["order_id"])', expect: [1, 3, 5, 6] },
        { call: 'sorted(int(x) for x in mid["order_id"])', expect: [3] },
        { call: 'sorted(int(x) for x in phones["order_id"])', expect: [1, 3, 5] },
        { call: '[int(x) for x in top2["order_id"]]', expect: [1, 2] },
        { call: 'metro.shape[1]', expect: 4, msg: 'keep all 4 columns' },
      ],
      explain: '`isin(list)` replaces many `==` conditions joined by `|`. `between(a, b)` includes both ends by default (499 is outside, 1200 is inside). `str.contains(..., case=False)` matches "iPhone", "Headphones" and "Phone Case". `nlargest(n, col)` is shorter and faster than sort + head.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Use **loc** and **iloc** on the `emp` DataFrame (index = employee code):\n1. `e3_salary`: the salary of employee `"E03"` (use `loc`)\n2. `first_two`: the first 2 rows and first 2 columns (use `iloc`)\n3. Give every employee of the **HR** department a salary of **45000** using `emp.loc[mask, "salary"] = ...` (change `emp` itself)',
      example: { title: 'loc to read and to update', code: 'df.loc["S02", "marks"]                      # one value by labels\ndf.iloc[:3, [0, 2]]                         # positions\ndf.loc[df["marks"] < 35, "result"] = "Fail"   # safe update' },
      starter: 'import pandas as pd\nemp = pd.DataFrame({\n    "name": ["Asha", "Vikram", "Neha", "Arjun"],\n    "dept": ["IT", "HR", "IT", "HR"],\n    "salary": [65000, 42000, 72000, 39000],\n}, index=["E01", "E02", "E03", "E04"])\n\n# TODO: e3_salary, first_two, update HR salaries\n',
      solution: 'import pandas as pd\nemp = pd.DataFrame({\n    "name": ["Asha", "Vikram", "Neha", "Arjun"],\n    "dept": ["IT", "HR", "IT", "HR"],\n    "salary": [65000, 42000, 72000, 39000],\n}, index=["E01", "E02", "E03", "E04"])\n\ne3_salary = emp.loc["E03", "salary"]\nfirst_two = emp.iloc[:2, :2]\nemp.loc[emp["dept"] == "HR", "salary"] = 45000\n',
      tests: [
        { call: 'int(e3_salary)', expect: 72000 },
        { call: '[list(first_two.shape), list(first_two.columns), list(first_two.index)]', expect: [[2, 2], ['name', 'dept'], ['E01', 'E02']] },
        { call: '[int(x) for x in emp["salary"]]', expect: [65000, 45000, 72000, 45000], msg: 'Both HR employees must now earn 45000 (others unchanged)' },
      ],
      explain: '`df.loc[row_selector, column] = value` updates the original DataFrame in one step. Chained indexing like `emp[emp.dept == "HR"]["salary"] = 45000` updates a temporary copy, shows *SettingWithCopyWarning* and leaves `emp` unchanged.',
    },
  ],
};
