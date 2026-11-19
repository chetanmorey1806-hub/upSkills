// Day Task (auto-graded practice) for day-44-excel-tables-structured-references
export default {
  "lesson": "day-44-excel-tables-structured-references",
  "minutes": 20,
  "intro": "Create Excel Tables and use structured references, calculated columns and the Total Row.",
  "tasks": [
    {
      "type": "fill",
      "mins": 1,
      "q": "Which shortcut converts a range into an **Excel Table**?",
      "accept": [
        "Ctrl+T"
      ],
      "acceptRegex": [
        "^\\s*(ctrl|control)\\s*\\+\\s*T\\s*$",
        "^\\s*(ctrl|control)\\s*\\+\\s*L\\s*$"
      ],
      "explain": "**Ctrl + T** (or Ctrl + L, or Insert > Tables > Table). Tick \"My table has headers\" if row 1 contains column names."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Inside the table `tblSales`, which structured reference means \"the Qty value **in the same row**\"?",
      "options": [
        "tblSales[Qty]",
        "[@Qty]",
        "tblSales[#Totals]",
        "[Qty]#"
      ],
      "answer": 1,
      "explain": "**[@Qty]** = this row's Qty. `tblSales[Qty]` is the whole Qty column (used in SUM). A calculated column like `=[@Qty]*[@Price]` fills down automatically."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Where do you **rename** a table (e.g. from Table1 to tblSales)?",
      "options": [
        "Table Design > Properties > Table Name",
        "Home > Format",
        "Formulas > Name Box only",
        "Data > Rename"
      ],
      "answer": 0,
      "explain": "Click inside the table and use **Table Design > Properties > Table Name**. Meaningful names like tblSales make formulas readable."
    },
    {
      "type": "output",
      "mins": 2,
      "q": "This table is named **tblSales**. What does `=SUM(tblSales[Amount])` return?",
      "code": "  | A     | B\n1 | Order | Amount\n2 | O-1   | 5000\n3 | O-2   | 6800\n4 | O-3   | 5394\n5 | O-4   | 6300\n\n=SUM(tblSales[Amount])",
      "expected": "23494",
      "explain": "tblSales[Amount] refers to the whole Amount column of the table (data rows only): 5000 + 6800 + 5394 + 6300 = **23494**. When new rows are added, the formula includes them automatically."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "The Amount column is a calculated column. Write a formula for the **total amount of North orders** (in a real table you would write `=SUMIFS(tblSales[Amount],tblSales[Region],\"North\")`; here use the ranges).",
      "example": {
        "title": "SUMIF on table columns",
        "code": "=SUMIFS(tblSales[Amount], tblSales[Region], \"West\")"
      },
      "grid": {
        "A1": "Order",
        "B1": "Region",
        "C1": "Qty",
        "D1": "Price",
        "E1": "Amount",
        "A2": "O-1",
        "B2": "North",
        "C2": "4",
        "D2": "1250",
        "E2": "=C2*D2",
        "A3": "O-2",
        "B3": "West",
        "C3": "2",
        "D3": "3400",
        "E3": "=C3*D3",
        "A4": "O-3",
        "B4": "North",
        "C4": "6",
        "D4": "899",
        "E4": "=C4*D4",
        "A5": "O-4",
        "B5": "South",
        "C5": "3",
        "D5": "2100",
        "E5": "=C5*D5"
      },
      "starter": "",
      "solution": "=SUMIF(B2:B5,\"North\",E2:E5)",
      "explain": "North: 5000 + 5394 = **10394**. Structured references work exactly like ranges inside functions, but they grow with the table."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which are benefits of using an **Excel Table**? (choose all that apply)",
      "options": [
        "Formulas and pivots auto-expand when rows are added",
        "Banded rows and filter buttons are added automatically",
        "A Total Row can be switched on",
        "Merged cells are allowed in the header"
      ],
      "answers": [
        0,
        1,
        2
      ],
      "explain": "Tables grow automatically, carry styles and filters, and offer a Total Row (Table Design > Table Style Options). Tables do **not** allow merged cells."
    }
  ]
};
