export default {
  id: "day-02-excel-automation-openpyxl-pandas",
  title: "Excel Automation with openpyxl and pandas",
  module: "Module 1: Files & Office Automation",
  day: 2,
  level: "Beginner",
  duration: "3 hours",
  summary: "Automate Excel work with Python: read and write .xlsx files, apply formatting, insert formulas, combine many workbooks with pandas and add charts with openpyxl. This is one of the most demanded automation skills in Indian offices.",
  objectives: [
    "Read and write Excel files using pandas read_excel() and to_excel()",
    "Open workbooks, sheets and cells with openpyxl and edit values",
    "Apply fonts, fills, borders, number formats and column widths",
    "Write Excel formulas and understand formulas vs cached values",
    "Create bar and line charts inside a workbook with openpyxl.chart",
    "Combine many Excel files into one summary report",
  ],
  theory: [
    {
      heading: "pandas vs openpyxl: Which One When?",
      content: "Both libraries work with .xlsx files, but they solve different problems. **pandas** is for data: read a sheet into a DataFrame, filter, group, merge and write the result. It does not care about colours or fonts. **openpyxl** is for the workbook itself: cells, styles, formulas, merged cells, charts, freeze panes. In real projects you often use both: pandas to calculate, openpyxl to make the output look professional.",
      points: [
        "pip install pandas openpyxl  (pandas uses openpyxl as its .xlsx engine)",
        "Old .xls files need xlrd; .xlsb needs pyxlsb; openpyxl handles .xlsx/.xlsm only",
        "Excel does not need to be installed: these libraries read and write the file format directly",
      ],
      tip: "If the task is 'calculate something', start with pandas. If it is 'make the sheet look like the manager's template', use openpyxl.",
    },
    {
      heading: "Reading and Writing Excel with pandas",
      content: "`pd.read_excel()` reads one sheet (or many with `sheet_name=None`, which returns a dict of DataFrames). `df.to_excel()` writes a DataFrame. To write several sheets into one file use `pd.ExcelWriter` as a context manager.",
      syntax: `import pandas as pd

df = pd.read_excel("sales.xlsx", sheet_name="Jan")        # one sheet
all_sheets = pd.read_excel("sales.xlsx", sheet_name=None) # dict of DataFrames
df = pd.read_excel("sales.xlsx", usecols="A:D", skiprows=2)

with pd.ExcelWriter("report.xlsx", engine="openpyxl") as writer:
    df.to_excel(writer, sheet_name="Data", index=False)
    summary.to_excel(writer, sheet_name="Summary")
`,
      tip: "Use index=False unless the index carries real meaning, otherwise you get an extra unnamed column.",
    },
    {
      heading: "openpyxl Basics: Workbook, Worksheet, Cell",
      content: "A **Workbook** is the file, a **Worksheet** is a tab, and a **Cell** holds one value. Create a new file with `Workbook()` or open one with `load_workbook()`. Access cells with `ws[\"B2\"]` or `ws.cell(row=2, column=2)`. Rows and columns start at 1, not 0. `ws.append([...])` adds a full row at the bottom, and `ws.iter_rows(values_only=True)` loops over rows as tuples.",
      syntax: `from openpyxl import Workbook, load_workbook

wb = Workbook()
ws = wb.active
ws.title = "Sales"
ws.append(["Region", "Amount"])
ws.append(["North", 52000])
ws["C1"] = "Target"
wb.save("sales.xlsx")

wb = load_workbook("sales.xlsx")
ws = wb["Sales"]
for row in ws.iter_rows(min_row=2, values_only=True):
    print(row)
print(ws.max_row, ws.max_column)
`,
    },
    {
      heading: "Formatting: Fonts, Fills, Borders, Number Formats",
      content: "Styles live in `openpyxl.styles`. Assign a `Font`, `PatternFill`, `Border` or `Alignment` object to a cell. Number formats are strings, exactly like Excel's custom formats. Column widths are set through `ws.column_dimensions`, and `ws.freeze_panes = \"A2\"` keeps the header visible while scrolling.",
      syntax: `from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

header_font = Font(bold=True, color="FFFFFF")
header_fill = PatternFill(fill_type="solid", start_color="1F4E78")
thin = Side(style="thin", color="999999")

for cell in ws[1]:
    cell.font = header_font
    cell.fill = header_fill
    cell.alignment = Alignment(horizontal="center")
    cell.border = Border(top=thin, bottom=thin, left=thin, right=thin)

ws["B2"].number_format = "#,##0.00"
ws.column_dimensions["A"].width = 18
ws.freeze_panes = "A2"
ws.auto_filter.ref = ws.dimensions
`,
      tip: "Style objects are immutable in openpyxl. To change one attribute, create a new Font/Fill and assign it again.",
    },
    {
      heading: "Formulas and Cached Values",
      content: "Write a formula as a string beginning with `=`: `ws[\"D2\"] = \"=B2*C2\"`. openpyxl does **not** calculate formulas; Excel calculates them when the file is opened. When you load a file, `load_workbook(path)` gives the formula text, while `load_workbook(path, data_only=True)` gives the value Excel saved last time (or None if the file was created by Python and never opened in Excel).",
      points: [
        "Use English function names and commas: =SUM(B2:B10), =IF(B2>100,\"High\",\"Low\")",
        "Do not open with data_only=True and then save; you will lose all formulas",
        "If you need the numbers in Python, calculate them with pandas instead",
      ],
    },
    {
      heading: "Charts with openpyxl",
      content: "openpyxl can add native Excel charts (BarChart, LineChart, PieChart). You define a `Reference` to the data range and categories, add them to the chart and anchor the chart to a cell. The chart is real Excel, so it stays interactive for the user.",
      syntax: `from openpyxl.chart import BarChart, Reference

chart = BarChart()
chart.title = "Sales by Region"
chart.y_axis.title = "Amount (Rs)"
data = Reference(ws, min_col=2, min_row=1, max_row=ws.max_row)   # include header
cats = Reference(ws, min_col=1, min_row=2, max_row=ws.max_row)
chart.add_data(data, titles_from_data=True)
chart.set_categories(cats)
ws.add_chart(chart, "E2")
`,
    },
    {
      heading: "Typical Office Automation Workflows",
      content: "Most Excel automation jobs follow the same pattern: collect files, clean and combine, calculate, write a formatted report, deliver. Examples: merge 30 branch files into one, split a master sheet into one file per manager, highlight overdue invoices in red, refresh a monthly MIS report. Once written, the script turns a two-hour manual task into a one-click job.",
      points: [
        "Combine: glob all .xlsx files, read each with pandas, pd.concat()",
        "Split: df.groupby('Manager') and write each group to its own file",
        "Highlight: loop with openpyxl and set a fill when a condition is true, or add conditional formatting",
        "Deliver: email the file (Day 7) and schedule the script (Day 8)",
      ],
    },
  ],
  examples: [
    {
      title: "Create a Formatted Sales Sheet from Scratch",
      scenario: "Build a sales sheet with a bold coloured header, Indian-style number format, a total row using a formula and a frozen header.",
      steps: [
        "Install: pip install openpyxl",
        "Create main.py and paste the code",
        "Run: python main.py",
        "Open sales_report.xlsx in Excel or LibreOffice to see formatting and the calculated total",
      ],
      code: `from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment

rows = [
    ("North", "Laptop", 12, 55000),
    ("South", "Mobile", 40, 18000),
    ("West", "Tablet", 15, 25000),
    ("East", "Laptop", 9, 55000),
]

wb = Workbook()
ws = wb.active
ws.title = "Sales"
ws.append(["Region", "Product", "Qty", "Price", "Revenue"])
for i, (region, product, qty, price) in enumerate(rows, start=2):
    ws.append([region, product, qty, price, f"=C{i}*D{i}"])

last = ws.max_row
ws.append(["Total", "", f"=SUM(C2:C{last})", "", f"=SUM(E2:E{last})"])

for cell in ws[1]:
    cell.font = Font(bold=True, color="FFFFFF")
    cell.fill = PatternFill(fill_type="solid", start_color="1F4E78")
    cell.alignment = Alignment(horizontal="center")
for cell in ws[ws.max_row]:
    cell.font = Font(bold=True)

for row in ws.iter_rows(min_row=2, min_col=4, max_col=5):
    for cell in row:
        cell.number_format = "#,##0"
for col, width in {"A": 12, "B": 12, "C": 8, "D": 12, "E": 14}.items():
    ws.column_dimensions[col].width = width
ws.freeze_panes = "A2"

wb.save("sales_report.xlsx")
print("Saved sales_report.xlsx with", ws.max_row, "rows")
`,
      result: `Saved sales_report.xlsx with 6 rows
(In Excel: Revenue shows 660,000 / 720,000 / 375,000 / 495,000 and the Total row shows Qty 76 and Revenue 2,250,000)`,
      explanation: "ws.append() writes rows quickly. Revenue cells hold formulas like =C2*D2, and the total row uses =SUM(). Excel calculates them when the file is opened. ws[1] returns the first row, which we style with a Font and PatternFill. number_format applies a thousands separator. freeze_panes = 'A2' freezes everything above row 2.",
    },
    {
      title: "Read, Filter and Summarise with pandas",
      scenario: "The manager sends sales_report.xlsx and wants a summary of revenue per product in a new sheet, sorted from highest to lowest.",
      steps: [
        "Install: pip install pandas openpyxl",
        "Run Example 1 first so sales_report.xlsx exists, or use any sheet with Region/Product/Qty/Price columns",
        "Run: python main.py",
      ],
      code: `import pandas as pd

df = pd.read_excel("sales_report.xlsx", sheet_name="Sales")
df = df[df["Region"] != "Total"]          # drop the total row
df = df.astype({"Qty": int, "Price": int})  # blanks in the total row made them float
df["Revenue"] = df["Qty"] * df["Price"]   # formulas are not calculated by pandas, so compute here

summary = (
    df.groupby("Product", as_index=False)
      .agg(Units=("Qty", "sum"), Revenue=("Revenue", "sum"))
      .sort_values("Revenue", ascending=False)
)
print(summary.to_string(index=False))

with pd.ExcelWriter("sales_report.xlsx", engine="openpyxl", mode="a",
                    if_sheet_exists="replace") as writer:
    summary.to_excel(writer, sheet_name="Summary", index=False)
`,
      result: `Product  Units  Revenue
 Laptop     21  1155000
 Mobile     40   720000
 Tablet     15   375000`,
      explanation: "read_excel() loads the sheet. Because the file was created by openpyxl and never opened in Excel, the Revenue formulas have no cached values, so pandas reads them as NaN; we recompute Revenue in pandas. The blank cells in the Total row also turned Qty and Price into floats, so astype(int) converts them back after the row is removed. groupby + named aggregation builds the summary. ExcelWriter with mode='a' appends a new sheet to the existing workbook and if_sheet_exists='replace' lets you rerun the script safely.",
    },
    {
      title: "Combine Many Branch Files into One Master File",
      scenario: "Every branch sends a file like branch_pune.xlsx with the same columns. Combine them into one master sheet with a Branch column.",
      steps: [
        "Install: pip install pandas openpyxl",
        "Put all branch files in a folder named branches/",
        "Run: python main.py",
      ],
      code: `from pathlib import Path
import pandas as pd

frames = []
for file in sorted(Path("branches").glob("branch_*.xlsx")):
    df = pd.read_excel(file)
    df["Branch"] = file.stem.replace("branch_", "").title()
    frames.append(df)
    print(f"Read {file.name}: {len(df)} rows")

master = pd.concat(frames, ignore_index=True)
master.to_excel("master_sales.xlsx", index=False)
print("Master rows:", len(master))
print(master.groupby("Branch")["Amount"].sum())
`,
      result: `Read branch_delhi.xlsx: 120 rows
Read branch_mumbai.xlsx: 98 rows
Read branch_pune.xlsx: 75 rows
Master rows: 293
Branch
Delhi     812500
Mumbai    744300
Pune      401250
Name: Amount, dtype: int64
(numbers depend on your input files)`,
      explanation: "glob finds every branch file; sorted() keeps the order stable. The branch name comes from the file name (file.stem). pd.concat() stacks all DataFrames and ignore_index=True renumbers rows. One script replaces copy-pasting 30 files by hand.",
    },
    {
      title: "Highlight Low Stock and Add a Bar Chart",
      scenario: "An inventory sheet must highlight items with stock below the reorder level in light red and include a bar chart of stock per item.",
      steps: [
        "Install: pip install openpyxl",
        "Run: python main.py",
        "Open inventory.xlsx: low-stock rows are red and a chart appears next to the table",
      ],
      code: `from openpyxl import Workbook
from openpyxl.styles import PatternFill, Font
from openpyxl.chart import BarChart, Reference

data = [("Item", "Stock", "Reorder Level"),
        ("Rice 5kg", 120, 50), ("Sugar 1kg", 30, 40),
        ("Oil 1L", 15, 25), ("Atta 10kg", 80, 30)]

wb = Workbook()
ws = wb.active
ws.title = "Inventory"
for row in data:
    ws.append(row)
for cell in ws[1]:
    cell.font = Font(bold=True)

red = PatternFill(fill_type="solid", start_color="FFC7CE")
low = []
for row in ws.iter_rows(min_row=2):
    item, stock, reorder = row
    if stock.value < reorder.value:
        for cell in row:
            cell.fill = red
        low.append(item.value)

chart = BarChart()
chart.title = "Stock per Item"
chart.y_axis.title = "Units"
chart.add_data(Reference(ws, min_col=2, min_row=1, max_row=ws.max_row), titles_from_data=True)
chart.set_categories(Reference(ws, min_col=1, min_row=2, max_row=ws.max_row))
ws.add_chart(chart, "E2")

wb.save("inventory.xlsx")
print("Low stock:", low)
`,
      result: `Low stock: ['Sugar 1kg', 'Oil 1L']
(inventory.xlsx has those two rows filled light red and a bar chart anchored at cell E2)`,
      explanation: "iter_rows() without values_only returns Cell objects, so we can read .value and also change .fill. A Reference describes the data range; min_row=1 includes the header so titles_from_data=True uses it as the series name. add_chart() places the chart with its top-left corner at E2.",
    },
    {
      title: "Split a Master Sheet into One File per Manager",
      scenario: "HR has one sheet of all employees. Each manager should receive a separate Excel file with only their team.",
      steps: [
        "Install: pip install pandas openpyxl",
        "Prepare employees.xlsx with columns Name, Department, Manager, Salary",
        "Run: python main.py and check the output/ folder",
      ],
      code: `from pathlib import Path
import pandas as pd

df = pd.read_excel("employees.xlsx")
out = Path("output")
out.mkdir(exist_ok=True)

for manager, team in df.groupby("Manager"):
    safe = manager.replace(" ", "_").lower()
    path = out / f"team_{safe}.xlsx"
    team.sort_values("Name").to_excel(path, index=False)
    print(f"{manager}: {len(team)} employees -> {path.name}")
`,
      result: `Anil Kumar: 6 employees -> team_anil_kumar.xlsx
Neha Shah: 4 employees -> team_neha_shah.xlsx
Ravi Iyer: 5 employees -> team_ravi_iyer.xlsx
(names and counts depend on your data)`,
      explanation: "groupby('Manager') yields (key, sub-DataFrame) pairs. We build a safe file name from the manager's name and write each group. This is a common real task: one master file split into personalised files, which can then be emailed automatically.",
    },
  ],
  interview: [
    { q: "When would you use openpyxl instead of pandas for Excel?", a: "Use pandas for data analysis (filter, group, merge) and fast reading/writing of tables. Use openpyxl when you need control over the workbook: styles, column widths, formulas, merged cells, charts, freeze panes, data validation, or editing specific cells in an existing template without rewriting it.", level: "Easy" },
    { q: "Does openpyxl calculate formulas?", a: "No. It stores the formula text. Excel (or LibreOffice) calculates it when the file is opened. `load_workbook(data_only=True)` returns the last cached value saved by Excel, which is None for files generated by Python and never opened in Excel.", level: "Medium" },
    { q: "How do you read all sheets of a workbook with pandas?", a: "`pd.read_excel(\"file.xlsx\", sheet_name=None)` returns a dict where keys are sheet names and values are DataFrames. You can then `pd.concat(d.values())` to combine them.", level: "Easy" },
    { q: "How do you add a new sheet to an existing file without deleting other sheets?", a: "Use `pd.ExcelWriter(path, engine=\"openpyxl\", mode=\"a\", if_sheet_exists=\"replace\")`, or with openpyxl `wb = load_workbook(path); wb.create_sheet(\"New\")` then `wb.save(path)`. A plain `df.to_excel(path)` overwrites the whole file.", level: "Medium" },
    { q: "Are openpyxl rows and columns 0-based or 1-based?", a: "1-based. `ws.cell(row=1, column=1)` is A1. pandas DataFrame positions (`iloc`) are 0-based, which is a common source of off-by-one bugs.", level: "Easy" },
    { q: "How do you set a column width and freeze the header row?", a: "`ws.column_dimensions[\"A\"].width = 20` and `ws.freeze_panes = \"A2\"`. To auto-size, loop over columns, compute the maximum string length of the values and set width to that plus a small padding.", level: "Easy" },
    { q: "How would you process a very large Excel file that does not fit comfortably in memory?", a: "Use openpyxl `load_workbook(path, read_only=True)` and iterate rows lazily, or write with `Workbook(write_only=True)`. With pandas, read only needed columns (`usecols`) and convert to CSV/Parquet for repeated processing, since .xlsx parsing is slow.", level: "Hard" },
    { q: "What is the difference between ws.iter_rows(values_only=True) and without it?", a: "With values_only=True you get tuples of plain values, which is faster and simpler for reading. Without it you get Cell objects, which you need when you want to change styles or values, or read coordinates.", level: "Medium" },
    { q: "How do you add conditional formatting with openpyxl?", a: "Use `openpyxl.formatting.rule`, e.g. `ws.conditional_formatting.add(\"B2:B100\", CellIsRule(operator=\"lessThan\", formula=[\"40\"], fill=red_fill))`. Unlike a fixed fill, the rule is evaluated by Excel and updates when data changes.", level: "Hard" },
    { q: "A script works on your machine but fails with PermissionError on the client's PC. Why?", a: "Most likely the file is open in Excel, which locks it on Windows. Ask users to close it, write to a new file name (e.g. with a timestamp), or catch PermissionError and show a clear message.", level: "Medium" },
    { q: "How do you keep the formatting of a company template while filling in data?", a: "Load the template with `load_workbook(\"template.xlsx\")`, write values into the required cells only, and save under a new name. openpyxl keeps existing styles. Avoid `df.to_excel()` directly on the template because pandas rewrites the sheet.", level: "Medium" },
  ],
  practice: [
    {
      task: "Create marks.xlsx with columns Name, Maths, Science, English for 4 students. Add a Total column using an Excel formula and make the header bold.",
      hint: "Use ws.append() for rows and f'=SUM(B{r}:D{r})' for the formula.",
      solution: `from openpyxl import Workbook
from openpyxl.styles import Font

students = [("Asha", 88, 92, 79), ("Ravi", 67, 74, 81), ("Meena", 95, 89, 90), ("Karan", 55, 61, 70)]
wb = Workbook()
ws = wb.active
ws.append(["Name", "Maths", "Science", "English", "Total"])
for r, s in enumerate(students, start=2):
    ws.append(list(s) + [f"=SUM(B{r}:D{r})"])
for cell in ws[1]:
    cell.font = Font(bold=True)
wb.save("marks.xlsx")
`,
    },
    {
      task: "Read marks.xlsx with pandas, compute the total in Python, and print the topper's name.",
      hint: "Formulas are not evaluated by pandas, so add df[['Maths','Science','English']].sum(axis=1).",
      solution: `import pandas as pd

df = pd.read_excel("marks.xlsx")
df["Total"] = df[["Maths", "Science", "English"]].sum(axis=1)
topper = df.loc[df["Total"].idxmax(), "Name"]
print("Topper:", topper)   # Meena
`,
    },
    {
      task: "Write a function autofit(ws) that sets each column width to the longest value length + 2.",
      hint: "Loop ws.columns; each column is a tuple of cells; use get_column_letter or cells[0].column_letter.",
      solution: `def autofit(ws):
    for column in ws.columns:
        longest = max(len(str(c.value)) if c.value is not None else 0 for c in column)
        ws.column_dimensions[column[0].column_letter].width = longest + 2
`,
    },
    {
      task: "Given expenses.xlsx with columns Date, Category, Amount, create a Summary sheet with total per category and a pie chart.",
      hint: "pandas groupby for the totals, then openpyxl load_workbook + PieChart.",
      solution: `import pandas as pd
from openpyxl import load_workbook
from openpyxl.chart import PieChart, Reference

df = pd.read_excel("expenses.xlsx")
summary = df.groupby("Category", as_index=False)["Amount"].sum()
with pd.ExcelWriter("expenses.xlsx", engine="openpyxl", mode="a", if_sheet_exists="replace") as w:
    summary.to_excel(w, sheet_name="Summary", index=False)

wb = load_workbook("expenses.xlsx")
ws = wb["Summary"]
pie = PieChart()
pie.title = "Expenses by Category"
pie.add_data(Reference(ws, min_col=2, min_row=1, max_row=ws.max_row), titles_from_data=True)
pie.set_categories(Reference(ws, min_col=1, min_row=2, max_row=ws.max_row))
ws.add_chart(pie, "D2")
wb.save("expenses.xlsx")
`,
    },
  ],
  quiz: [
    { question: "Which command installs the libraries needed for this lesson?", options: ["pip install excel", "pip install pandas openpyxl", "pip install xlsx-python", "Nothing, they are built in"], answer: 1, explanation: "pandas and openpyxl are third-party packages installed with pip." },
    { question: "What does ws['A1'] refer to in openpyxl?", options: ["The first row", "The cell in column A, row 1", "The active workbook", "Column A"], answer: 1, explanation: "Indexing a worksheet with a coordinate string returns that Cell." },
    { question: "What does load_workbook('f.xlsx', data_only=True) return for a formula cell?", options: ["The formula text", "Always None", "The last value cached by Excel (None if never calculated)", "An error"], answer: 2, explanation: "data_only=True reads the cached value saved by Excel, not the formula." },
    { question: "Which pandas option reads every sheet of a workbook?", options: ["sheet_name='all'", "sheet_name=0", "sheet_name=None", "all_sheets=True"], answer: 2, explanation: "sheet_name=None returns a dictionary of DataFrames keyed by sheet name." },
    { question: "How do you freeze the first row in openpyxl?", options: ["ws.freeze_panes = 'A2'", "ws.freeze_panes = 'A1'", "ws.freeze(1)", "ws.row_dimensions[1].frozen = True"], answer: 0, explanation: "freeze_panes freezes rows above and columns left of the given cell, so A2 freezes row 1." },
    { question: "Why should you usually pass index=False to df.to_excel()?", options: ["It makes the file smaller by half", "To avoid writing the DataFrame index as an extra column", "To hide the header", "It is required by openpyxl"], answer: 1, explanation: "By default pandas writes the index as the first column, which is usually meaningless row numbers." },
  ],
};
