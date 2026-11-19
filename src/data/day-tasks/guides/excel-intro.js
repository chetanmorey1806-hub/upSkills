// Day Task (auto-graded practice) for excel-intro
export default {
  "lesson": "excel-intro",
  "minutes": 15,
  "intro": "Revise the Excel window, workbooks vs worksheets, data types, the Name Box, file formats and navigation shortcuts.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "A range written as **B2:D5** contains how many cells?",
      "options": [
        "8",
        "12",
        "9",
        "15"
      ],
      "answer": 1,
      "explain": "B to D = 3 columns, rows 2 to 5 = 4 rows → 3 × 4 = **12** cells. A common slip is subtracting (5 − 2 = 3) instead of counting inclusively."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "You type these into empty cells (default General format). Which are stored as **numbers**? (choose all that apply)",
      "options": [
        "1500",
        "15-Aug-2025",
        "'00125",
        "45%",
        "TRUE",
        "₹ 1,200 (typed with the ₹ symbol)"
      ],
      "answers": [
        0,
        1,
        3
      ],
      "explain": "Numbers, dates (serial numbers) and percentages are numbers; they align **right**. An apostrophe forces **text**, TRUE is a **Boolean**, and a typed ₹ symbol usually makes text unless your locale currency is ₹."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Which file format keeps **macros** and loads fastest for very large files?",
      "options": [
        ".xlsx",
        ".xlsb",
        ".csv",
        ".xltx"
      ],
      "answer": 1,
      "explain": "**.xlsb** (binary) supports macros and is smaller and faster for big workbooks. .xlsx cannot store macros, .csv keeps only values of one sheet, .xltx is a template."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "You type **Z5000** in the box at the left of the formula bar and press Enter to jump there. What is that box called?",
      "accept": [
        "Name Box",
        "Namebox"
      ],
      "explain": "The **Name Box** shows the active cell address, lets you jump to any address or named range, and can create a name for a selection."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Which shortcut selects the **whole current data region** (the block of data around the active cell)?",
      "accept": [
        "Ctrl+A",
        "Ctrl+Shift+8",
        "Ctrl+*"
      ],
      "acceptRegex": [
        "^\\s*(ctrl|control)\\s*\\+\\s*A\\s*$",
        "^\\s*(ctrl|control)\\s*\\+\\s*Shift\\s*\\+\\s*8\\s*$",
        "^\\s*(ctrl|control)\\s*\\+\\s*\\*\\s*$"
      ],
      "explain": "Inside a data block, **Ctrl + A** selects the current region (press again for the whole sheet). **Ctrl + Shift + 8 (Ctrl + *)** also selects the current region."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Count how many cells in **B2:B7** contain **numbers** (the import placed some amounts as text and left one blank).",
      "example": {
        "title": "counting numbers vs. non-empty cells",
        "code": "=COUNT(C2:C20)    numbers only\n=COUNTA(C2:C20)   anything not empty"
      },
      "grid": {
        "A1": "Item",
        "B1": "Amount",
        "A2": "Pen",
        "B2": "20",
        "A3": "Notebook",
        "B3": "NA",
        "A4": "Bag",
        "B4": "450",
        "A5": "Bottle",
        "A6": "Pencil box",
        "B6": "85",
        "A7": "Marker",
        "B7": "pending"
      },
      "starter": "",
      "solution": "=COUNT(B2:B7)",
      "explain": "COUNT counts only **numeric** cells: 20, 450, 85 → **3**. COUNTA would count every non-empty cell (5), including the text \"NA\" and \"pending\". This is a quick way to detect data-type problems."
    }
  ]
};
