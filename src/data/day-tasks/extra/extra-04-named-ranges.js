// Day Task (auto-graded practice) for extra-04-named-ranges
export default {
  "lesson": "extra-04-named-ranges",
  "minutes": 20,
  "intro": "Create, use and manage named ranges so formulas read like =Amount*GST_Rate.",
  "tasks": [
    {
      "type": "multi",
      "mins": 2,
      "q": "Which of these are **valid** Excel names? (choose all that apply)",
      "options": [
        "GST_Rate",
        "Sales2025",
        "_Total",
        "Sales 2025",
        "2025Sales",
        "A1",
        "Price.List"
      ],
      "answers": [
        0,
        1,
        2,
        6
      ],
      "explain": "A name must start with a **letter, underscore or backslash**, contain **no spaces**, and must not look like a cell reference (`A1`, `R1C1`). Dots and underscores are allowed, so `Price.List` is valid. `Sales 2025` (space) and `2025Sales` (starts with a digit) are invalid."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Which shortcut opens the **Name Manager**?",
      "accept": [
        "Ctrl+F3"
      ],
      "acceptRegex": [
        "^\\s*(ctrl|control)\\s*\\+\\s*F3\\s*$"
      ],
      "explain": "**Ctrl + F3** opens Name Manager (Formulas > Defined Names > Name Manager), where you edit, delete or fix names that show #REF!."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "You select A1:D50 (headers in row 1) and want a name for every column at once. Which command do you use?",
      "options": [
        "Define Name",
        "Create from Selection (Ctrl+Shift+F3) > Top row",
        "Name Box",
        "Paste Names (F3)"
      ],
      "answer": 1,
      "explain": "**Formulas > Create from Selection** (Ctrl + Shift + F3) with **Top row** ticked creates one name per column, using the header text. Define Name and the Name Box create one name at a time."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "The name **GST_Rate** refers to cell **$E$2** (18%). The practice sheet has no names defined, so write the formula `=B3*GST_Rate` using the **address the name points to**, to get the GST on the Mouse amount.",
      "example": {
        "title": "a name is an absolute reference",
        "text": "If Discount refers to $F$1, then =C2*Discount is the same as:",
        "code": "=C2*$F$1"
      },
      "grid": {
        "A1": "Item",
        "B1": "Amount",
        "E1": "GST_Rate",
        "A2": "Keyboard",
        "B2": "1200",
        "E2": "0.18",
        "A3": "Mouse",
        "B3": "650"
      },
      "starter": "",
      "solution": "=B3*$E$2",
      "explain": "A name is just a readable **absolute reference**: `GST_Rate` = `$E$2`. That is why copying `=B2*GST_Rate` down never shifts the rate cell. 650 × 0.18 = **117**."
    },
    {
      "type": "output",
      "mins": 2,
      "q": "The name **Sales** refers to `B2:B5`. What does this formula return?",
      "code": "  | A     | B\n1 | Month | Sales\n2 | Apr   | 42000\n3 | May   | 38500\n4 | Jun   | 45250\n5 | Jul   | 40100\n\nB6: =SUM(Sales)",
      "expected": "165850",
      "explain": "`=SUM(Sales)` is exactly `=SUM(B2:B5)` = **165850**. Names make the formula easier to read, they do not change the result."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "You define the name **Target** with scope **Sheet1** and another **Target** with scope **Workbook**. In a formula on Sheet1, `=Target` uses:",
      "options": [
        "The Workbook-level name",
        "The Sheet1-level name",
        "Excel shows #NAME?",
        "Excel asks which one to use"
      ],
      "answer": 1,
      "explain": "A **sheet-level** name wins on its own sheet; other sheets use the workbook-level name. Scope is chosen when the name is created and cannot be changed later in Name Manager (you must delete and recreate it)."
    }
  ]
};
