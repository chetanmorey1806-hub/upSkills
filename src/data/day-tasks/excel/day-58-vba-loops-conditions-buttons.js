// Day Task (auto-graded practice) for day-58-vba-loops-conditions-buttons
export default {
  "lesson": "day-58-vba-loops-conditions-buttons",
  "minutes": 25,
  "intro": "Read and predict VBA decisions and loops (If, Select Case, For, For Each, Do), and automate with buttons and events.",
  "tasks": [
    {
      "type": "output",
      "mins": 2,
      "q": "What does the message box show?",
      "code": "Dim i As Long, total As Long\nFor i = 1 To 5\n    total = total + i\nNext i\nMsgBox total",
      "expected": "15",
      "explain": "The loop adds 1+2+3+4+5 = **15**. A Long variable starts at 0."
    },
    {
      "type": "output",
      "mins": 2,
      "q": "What does the message box show for marks = 72?",
      "code": "Dim marks As Long, g As String\nmarks = 72\nIf marks >= 80 Then\n    g = \"A\"\nElseIf marks >= 60 Then\n    g = \"B\"\nElse\n    g = \"C\"\nEnd If\nMsgBox g",
      "expected": "B",
      "explain": "72 is not >= 80 but is >= 60, so the ElseIf branch runs: **B**."
    },
    {
      "type": "output",
      "mins": 2,
      "q": "What does the message box show for qty = 150?",
      "code": "Dim qty As Long\nqty = 150\nSelect Case qty\n    Case 0\n        MsgBox \"None\"\n    Case 1 To 100\n        MsgBox \"Normal\"\n    Case Is > 100\n        MsgBox \"Bulk\"\nEnd Select",
      "expected": "Bulk",
      "explain": "150 is not 0 and not in 1 To 100; `Case Is > 100` matches → **Bulk**."
    },
    {
      "type": "output",
      "mins": 2,
      "q": "How many times does the message box appear? (type the number)",
      "code": "Dim n As Long\nn = 1\nDo While n < 20\n    MsgBox n\n    n = n * 3\nLoop",
      "expected": "3",
      "explain": "n = 1 → shows, n = 3 → shows, n = 9 → shows, n = 27 → loop stops. The box appears **3** times."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Complete the line that finds the **last used row** in column A: `lastRow = Cells(Rows.Count, 1).End(______).Row`",
      "accept": [
        "xlUp"
      ],
      "explain": "`Cells(Rows.Count, 1).End(xlUp).Row` starts at the very last row of column A and jumps up to the last filled cell, so loops work for any amount of data."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Which event procedure runs **automatically when a cell value is changed** on a sheet?",
      "options": [
        "Workbook_Open",
        "Worksheet_Change",
        "Worksheet_Activate",
        "Auto_Close"
      ],
      "answer": 1,
      "explain": "**Worksheet_Change(ByVal Target As Range)** runs after any cell on that sheet is edited. Workbook_Open runs when the file opens. Add `Application.EnableEvents = False` while your code changes cells to avoid endless loops."
    }
  ]
};
