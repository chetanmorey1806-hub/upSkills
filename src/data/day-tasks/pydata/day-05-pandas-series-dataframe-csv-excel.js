export default {
  lesson: 'day-05-pandas-series-dataframe-csv-excel',
  minutes: 30,
  intro: 'Create Series and DataFrames, explore them with shape/describe/value_counts, add, rename, drop and sort columns, and read/write CSV files.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What does this print?',
      code: `import pandas as pd
marks = pd.Series([78, 92, 65], index=["Asha", "Ravi", "Neha"])
print(marks["Ravi"])
print(marks.max(), marks.idxmax())
print(list(marks[marks > 70].index))
print(len(marks))`,
      expected: '92\n92 Ravi\n[\'Asha\', \'Ravi\']\n3',
      explain: 'A Series is a column of values with an **index** of labels. `marks["Ravi"]` looks up by label, `idxmax()` returns the **label** of the maximum (use `max()` for the value), and a boolean filter keeps the matching labels.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'You just loaded a new CSV into `df`. Which of these are good "first 5 minutes" checks? (choose all that apply)',
      options: ['`df.shape` – rows and columns', '`df.info()` – dtypes and non-null counts', '`df.describe()` – summary statistics of numeric columns', '`df["city"].value_counts()` – frequency of each city', '`df.plot()` before checking the dtypes', '`df.head()` – first rows'],
      answers: [0, 1, 2, 3, 5],
      explain: 'Always look before you analyse: `shape`, `head()`, `info()` (are numbers really numeric? any missing values?), `describe()` and `value_counts()`/`nunique()` on category columns. Plotting before checking dtypes often hides problems like numbers stored as text.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which call saves `df` to `report.csv` **without** the extra unnamed index column?',
      options: ['df.to_csv("report.csv")', 'df.to_csv("report.csv", index=False)', 'df.save_csv("report.csv")', 'pd.write_csv(df, "report.csv")'],
      answer: 1,
      explain: 'By default `to_csv` also writes the row index, which comes back as an "Unnamed: 0" column when the file is read again. `index=False` avoids that. The same option exists for `to_excel("report.xlsx", sheet_name="Sales", index=False)`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Build an employee DataFrame `df` with columns `name`, `dept`, `salary` from the data in the starter. Then:\n1. add a column `annual` = salary × 12\n2. rename `dept` to `department`\n3. sort the rows by `salary` from **highest to lowest** (keep the result in `df`)\n4. `it_count`: number of employees in IT (int, use `value_counts()` or a filter)',
      example: { title: 'building and changing a DataFrame', code: 'df = pd.DataFrame({"item": ["Pen", "Book"], "price": [10, 120]})\ndf["with_gst"] = df["price"] * 1.18\ndf = df.rename(columns={"item": "product"})\ndf = df.sort_values("price", ascending=False)' },
      starter: 'import pandas as pd\nnames = ["Asha", "Vikram", "Neha", "Arjun", "Pooja"]\ndepts = ["IT", "HR", "IT", "Sales", "IT"]\nsalaries = [65000, 42000, 72000, 48000, 51000]\n\n# TODO: df = pd.DataFrame(...)\n',
      solution: 'import pandas as pd\nnames = ["Asha", "Vikram", "Neha", "Arjun", "Pooja"]\ndepts = ["IT", "HR", "IT", "Sales", "IT"]\nsalaries = [65000, 42000, 72000, 48000, 51000]\n\ndf = pd.DataFrame({"name": names, "dept": depts, "salary": salaries})\ndf["annual"] = df["salary"] * 12\ndf = df.rename(columns={"dept": "department"})\ndf = df.sort_values("salary", ascending=False)\nit_count = int(df["department"].value_counts()["IT"])\n',
      tests: [
        { call: 'list(df.columns)', expect: ['name', 'department', 'salary', 'annual'] },
        { call: 'df["name"].tolist()', expect: ['Neha', 'Asha', 'Pooja', 'Arjun', 'Vikram'], msg: 'rows must be sorted by salary, highest first' },
        { call: '[int(x) for x in df["annual"]]', expect: [864000, 780000, 612000, 576000, 504000] },
        { call: 'int(it_count)', expect: 3 },
      ],
      explain: 'A dict of lists is the easiest way to build a DataFrame (keys become columns). Most pandas methods (`rename`, `sort_values`, `drop`) return a **new** DataFrame, so assign the result back – forgetting `df = ...` is the #1 beginner bug. `ascending=False` sorts high to low.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: '**CSV round trip.** The starter has a DataFrame `orders`.\n1. Save it to `orders.csv` **without the index**\n2. Read it back into `loaded` with `pd.read_csv`, keeping only the columns `order_id` and `amount` (`usecols`)\n3. `total`: the sum of `loaded["amount"]` (int)\n4. `n_cols`: the number of columns in `loaded`',
      example: { title: 'to_csv / read_csv', code: 'df.to_csv("students.csv", index=False)\nback = pd.read_csv("students.csv", usecols=["name", "marks"])\nprint(back.shape)' },
      starter: 'import pandas as pd\norders = pd.DataFrame({\n    "order_id": [101, 102, 103, 104],\n    "city": ["Pune", "Delhi", "Pune", "Chennai"],\n    "amount": [1250, 830, 2100, 640],\n})\n\n# TODO: save, read back, total, n_cols\n',
      solution: 'import pandas as pd\norders = pd.DataFrame({\n    "order_id": [101, 102, 103, 104],\n    "city": ["Pune", "Delhi", "Pune", "Chennai"],\n    "amount": [1250, 830, 2100, 640],\n})\n\norders.to_csv("orders.csv", index=False)\nloaded = pd.read_csv("orders.csv", usecols=["order_id", "amount"])\ntotal = int(loaded["amount"].sum())\nn_cols = loaded.shape[1]\n',
      tests: [
        { call: 'open("orders.csv").readline().strip()', expect: 'order_id,city,amount', msg: 'orders.csv must be saved without the index column' },
        { call: 'list(loaded.columns)', expect: ['order_id', 'amount'] },
        { call: 'int(total)', expect: 4820 },
        { call: 'int(n_cols)', expect: 2 },
      ],
      explain: '`index=False` keeps the file clean (first line = the real column names). `usecols` loads only the columns you need – faster and lighter for big files. Other useful `read_csv` options: `sep=";"`, `dtype={"pincode": str}`, `parse_dates=["date"]`.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the line that reads the sheet named **Q1** from `sales.xlsx`:\n\n`q1 = pd.read_excel("sales.xlsx", ____="Q1")`',
      accept: ['sheet_name'],
      explain: '`read_excel` reads the first sheet by default; `sheet_name="Q1"` picks one sheet and `sheet_name=None` returns a dict of **all** sheets. pandas needs the `openpyxl` package to read/write .xlsx files.',
    },
  ],
};
