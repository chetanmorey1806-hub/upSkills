// Day Task (auto-graded practice) for day-01-introduction-to-excel
export default {
  "lesson": "day-01-introduction-to-excel",
  "minutes": 15,
  "intro": "Check the basic building blocks of Excel (workbook, worksheet, rows, columns, cells) and write your very first formula.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "What is the correct name for a single **Excel file** (for example `Sales_2025.xlsx`)?",
      "options": [
        "Worksheet",
        "Workbook",
        "Cell",
        "Ribbon"
      ],
      "answer": 1,
      "explain": "An Excel **file** is called a **workbook**. A workbook contains one or more **worksheets** (the sheet tabs at the bottom). Students often mix them up: think of a workbook as a notebook and each worksheet as one page inside it."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "In Excel, **rows** are identified by ______ and **columns** by ______.",
      "options": [
        "letters, numbers",
        "numbers, letters",
        "numbers, numbers",
        "letters, letters"
      ],
      "answer": 1,
      "explain": "Rows run horizontally and are numbered **1, 2, 3...**; columns run vertically and are lettered **A, B, C...**. That is why a cell address always has the column letter first and then the row number, like **B4**."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "A cell is in **column D** and **row 7**. What is its cell address?",
      "accept": [
        "D7",
        "$D$7"
      ],
      "explain": "A cell address is the **column letter followed by the row number**: column D + row 7 = **D7**. Writing `7D` is a common mistake: Excel never puts the number first."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "What is the address of the **last column** in a modern Excel worksheet (Excel 2007 and later)?",
      "accept": [
        "XFD"
      ],
      "explain": "Modern Excel has **16,384 columns**, from A to **XFD**, and **1,048,576 rows**. The old .xls format (Excel 2003) had only 256 columns (up to IV) and 65,536 rows."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which of these are common **office uses** of Excel? (choose all that apply)",
      "options": [
        "Maintaining a salary sheet for employees",
        "Tracking daily sales and stock",
        "Preparing a student marks sheet with totals",
        "Editing a video for YouTube",
        "Making charts and reports for a manager"
      ],
      "answers": [
        0,
        1,
        2,
        4
      ],
      "explain": "Excel is used for anything that is **data in rows and columns + calculations**: salary sheets, sales and stock registers, marks sheets, budgets, charts and reports. Video editing needs a different tool."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "A shop recorded the **price** and **quantity** of one item. Write a formula that calculates the **amount** (price x quantity) using the cell addresses, not the typed numbers.",
      "example": {
        "title": "adding two cells",
        "text": "If A1 has 10 and A2 has 20, the formula `=A1+A2` shows 30.",
        "code": "=A1+A2"
      },
      "grid": {
        "A1": "Item",
        "B1": "Price",
        "C1": "Qty",
        "A2": "Notebook",
        "B2": "45",
        "C2": "12"
      },
      "starter": "",
      "solution": "=B2*C2",
      "explain": "A formula always starts with **=**. Using cell addresses (`=B2*C2`) instead of numbers (`=45*12`) means the result updates automatically when the price or quantity changes. In Excel, `*` is the multiply sign (not `x`)."
    }
  ]
};
