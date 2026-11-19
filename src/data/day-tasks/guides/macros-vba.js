// Day Task (auto-graded practice) for macros-vba
export default {
  "lesson": "macros-vba",
  "minutes": 18,
  "intro": "Revise recording macros, the VBA Editor, Sub vs Function, Range/Cells, loops, MsgBox and error handling.",
  "tasks": [
    {
      "type": "fill",
      "mins": 1,
      "q": "Which shortcut opens the **VBA Editor**?",
      "accept": [
        "Alt+F11"
      ],
      "acceptRegex": [
        "^\\s*Alt\\s*\\+\\s*F11\\s*$"
      ],
      "explain": "**Alt + F11** opens the Visual Basic Editor (VBE). **Alt + F8** opens the Macros dialog to run a macro."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "You record a macro with **Use Relative References** ON and select the cell one row below. What does the recorded code do when run later?",
      "options": [
        "Always selects the same fixed cell, e.g. B5",
        "Selects the cell one row below whichever cell is active",
        "Selects A1",
        "Records nothing"
      ],
      "answer": 1,
      "explain": "Relative recording stores **offsets** (`ActiveCell.Offset(1, 0).Select`), so the macro works from any starting cell. Absolute recording stores fixed addresses like `Range(\"B5\").Select`."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Which is TRUE about a VBA **Function** compared with a **Sub**?",
      "options": [
        "A Function cannot take arguments",
        "A Function returns a value and can be used in a cell like =GSTAMT(A2); a Sub performs actions and is run as a macro",
        "A Sub returns a value",
        "Both can be typed in a cell"
      ],
      "answer": 1,
      "explain": "A **Function** (UDF) returns a value by assigning to its own name and can be called from worksheet formulas. A **Sub** is a macro run from Alt+F8, a button or an event."
    },
    {
      "type": "output",
      "mins": 2,
      "q": "What is in cell A1 after this macro runs?",
      "code": "Sub Test()\n    Dim i As Integer, total As Integer\n    For i = 1 To 5\n        total = total + i\n    Next i\n    Range(\"A1\").Value = total\nEnd Sub",
      "expected": "15",
      "explain": "The loop adds 1 + 2 + 3 + 4 + 5 = **15**. Integer variables start at 0, so total begins at 0."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "A VBA Function is planned: `Function GSTAMT(amt As Double) As Double: GSTAMT = amt * 0.18`. Before writing it, check the result for the amount in **B3** with a normal formula.",
      "example": {
        "title": "formula equivalent of a UDF",
        "code": "Function DISC(p): DISC = p * 0.9\n=B2*0.9"
      },
      "grid": {
        "A1": "Item",
        "B1": "Amount",
        "A2": "Monitor",
        "B2": "9800",
        "A3": "Printer",
        "B3": "12500",
        "A4": "Cable",
        "B4": "350"
      },
      "starter": "",
      "solution": "=B3*0.18",
      "explain": "12,500 × 0.18 = **2,250**. Once the UDF is saved in a module of an .xlsm file, `=GSTAMT(B3)` returns the same value. Testing with a normal formula first catches logic mistakes."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Which file extension must a workbook with macros be saved as (not binary, not a template)?",
      "accept": [
        ".xlsm",
        "xlsm"
      ],
      "explain": "**.xlsm** keeps the VBA code. Saving as .xlsx removes all macros (Excel warns you)."
    }
  ]
};
