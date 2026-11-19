export default {
  lesson: 'day-02-excel-automation-openpyxl-pandas',
  minutes: 35,
  intro: 'Know when to use pandas vs openpyxl, the openpyxl workbook/cell API, formatting, formulas and charts, and automate the classic office jobs: combine branch files, summarise, flag low stock and split a master sheet.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'You need to read 30 branch Excel files, combine them and compute totals. Which tool is the natural first choice?',
      options: ['openpyxl, cell by cell', 'pandas (read_excel + concat + groupby)', 'python-docx', 'pyautogui to click through Excel'],
      answer: 1,
      explain: '**pandas** is best for data work: reading, combining, filtering and summarising tables. **openpyxl** is best for the *look* of a workbook: fonts, fills, borders, number formats, formulas, charts and editing an existing template. Real reports often use both: pandas for numbers, openpyxl for formatting.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which openpyxl statements are correct? (choose all that apply)',
      options: ['`wb = Workbook(); ws = wb.active` creates a workbook and gets the first sheet', '`ws["B2"] = 1500` writes a value to cell B2', '`ws["D2"] = "=B2*C2"` stores a formula that Excel calculates when the file is opened', '`ws.cell(row=1, column=1).font = Font(bold=True)` makes A1 bold', '`load_workbook("x.xlsx")` returns the formula results unless you pass `data_only=True`'],
      answers: [0, 1, 2, 3],
      explain: 'By default `load_workbook` returns the **formulas** (e.g. "=B2*C2"); with `data_only=True` it returns the cached results that Excel saved last time (None if the file was created by openpyxl and never opened in Excel). openpyxl does not calculate formulas itself.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the openpyxl line that shows the values of column C as Indian-style currency with 2 decimals: `cell.number_format = "____"` (e.g. `₹#,##0.00`)',
      accept: ['₹#,##0.00', '"₹"#,##0.00', '₹ #,##0.00', '[$₹-4009]#,##0.00', '#,##0.00', '₹#,##,##0.00'],
      explain: 'Number formats change only how a number is **displayed**; the cell still holds a number you can sum. Writing "₹1,500" as text breaks totals and charts. `#,##0.00` = thousands separator and 2 decimals.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: '**Combine branch files.** The starter writes three branch CSV files into `branches/` (the same idea works with `pd.read_excel` on .xlsx files). Write `combine(folder)` that reads every `*.csv` in the folder, adds a column `branch` = the file name without extension, and returns one DataFrame. Then set `summary` = total `amount` per branch as a dict `{branch: total}` (ints).',
      example: { title: 'reading many files', code: 'frames = []\nfor f in sorted(Path("months").glob("*.csv")):\n    df = pd.read_csv(f)\n    df["month"] = f.stem\n    frames.append(df)\nall_data = pd.concat(frames, ignore_index=True)' },
      starter: `import pandas as pd
from pathlib import Path

Path("branches").mkdir(exist_ok=True)
pd.DataFrame({"item": ["Pen", "Book"], "amount": [1200, 3400]}).to_csv("branches/pune.csv", index=False)
pd.DataFrame({"item": ["Bag", "Pen", "Lamp"], "amount": [2500, 600, 1800]}).to_csv("branches/nagpur.csv", index=False)
pd.DataFrame({"item": ["Book"], "amount": [900]}).to_csv("branches/nashik.csv", index=False)

def combine(folder):
    # TODO
    pass

summary = {}   # TODO
`,
      solution: `import pandas as pd
from pathlib import Path

Path("branches").mkdir(exist_ok=True)
pd.DataFrame({"item": ["Pen", "Book"], "amount": [1200, 3400]}).to_csv("branches/pune.csv", index=False)
pd.DataFrame({"item": ["Bag", "Pen", "Lamp"], "amount": [2500, 600, 1800]}).to_csv("branches/nagpur.csv", index=False)
pd.DataFrame({"item": ["Book"], "amount": [900]}).to_csv("branches/nashik.csv", index=False)

def combine(folder):
    frames = []
    for f in sorted(Path(folder).glob("*.csv")):
        df = pd.read_csv(f)
        df["branch"] = f.stem
        frames.append(df)
    return pd.concat(frames, ignore_index=True)

master = combine("branches")
summary = {k: int(v) for k, v in master.groupby("branch")["amount"].sum().items()}
`,
      tests: [
        { call: 'len(combine("branches"))', expect: 6 },
        { call: 'sorted(combine("branches")["branch"].unique().tolist())', expect: ['nagpur', 'nashik', 'pune'] },
        { call: '{k: int(v) for k, v in summary.items()}', expect: { pune: 4600, nagpur: 4900, nashik: 900 } },
      ],
      explain: 'Glob the folder so new branch files are picked up automatically, tag each row with its source, and `concat` once at the end (concatenating inside the loop is slow). `ignore_index=True` gives a clean 0..n-1 index.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: '**Low-stock flags and split by manager.** Using the `stock` DataFrame:\n1. add `status` = `"REORDER"` when `qty < reorder_level`, else `"OK"`\n2. `low_items`: list of item names that need reordering\n3. `per_manager`: dict `{manager: number_of_items}` – in a real job each group would become its own file with `df.to_excel(f"{manager}.xlsx")`',
      example: { title: 'splitting a master sheet', code: 'for manager, part in df.groupby("manager"):\n    part.to_excel(f"{manager}_stock.xlsx", index=False)' },
      starter: `import pandas as pd
import numpy as np
stock = pd.DataFrame({
    "item": ["Pen", "Notebook", "Stapler", "Marker", "Bag"],
    "qty": [500, 35, 8, 120, 4],
    "reorder_level": [200, 50, 10, 100, 5],
    "manager": ["Asha", "Ravi", "Asha", "Ravi", "Neha"],
})

# TODO
`,
      solution: `import pandas as pd
import numpy as np
stock = pd.DataFrame({
    "item": ["Pen", "Notebook", "Stapler", "Marker", "Bag"],
    "qty": [500, 35, 8, 120, 4],
    "reorder_level": [200, 50, 10, 100, 5],
    "manager": ["Asha", "Ravi", "Asha", "Ravi", "Neha"],
})

stock["status"] = np.where(stock["qty"] < stock["reorder_level"], "REORDER", "OK")
low_items = stock.loc[stock["status"] == "REORDER", "item"].tolist()
per_manager = {m: len(part) for m, part in stock.groupby("manager")}
`,
      tests: [
        { call: '[str(s) for s in stock["status"]]', expect: ['OK', 'REORDER', 'REORDER', 'OK', 'REORDER'] },
        { call: 'list(low_items)', expect: ['Notebook', 'Stapler', 'Bag'] },
        { call: '{k: int(v) for k, v in per_manager.items()}', expect: { Asha: 2, Ravi: 2, Neha: 1 } },
      ],
      explain: 'Compute the flag with pandas, then (in the real script) use openpyxl to colour REORDER rows red with a `PatternFill` or conditional formatting. `groupby` gives you one sub-table per manager to save as separate files – the classic "split the master sheet" task.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'In openpyxl, which code adds a bar chart of sales in B2:B6 with labels in A2:A6 at cell E2?',
      options: [
        'ws.add_chart("bar", "B2:B6")',
        'chart = BarChart()\ndata = Reference(ws, min_col=2, min_row=1, max_row=6)\ncats = Reference(ws, min_col=1, min_row=2, max_row=6)\nchart.add_data(data, titles_from_data=True)\nchart.set_categories(cats)\nws.add_chart(chart, "E2")',
        'ws.plot(kind="bar")',
        'BarChart(ws["A2:B6"]).save("E2")',
      ],
      answer: 1,
      explain: 'openpyxl charts are built from `Reference` objects: the data range (including the header row when `titles_from_data=True`) and the category labels, then placed with `ws.add_chart(chart, "E2")`. The chart is a real Excel chart that updates if the numbers change.',
    },
  ],
};
