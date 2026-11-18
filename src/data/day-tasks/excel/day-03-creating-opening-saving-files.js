// Day Task (auto-graded practice) for day-03-creating-opening-saving-files
export default {
  "lesson": "day-03-creating-opening-saving-files",
  "minutes": 15,
  "intro": "Practise the file life cycle in Excel: new, open, save, save as, close, and the right file extension for each job.",
  "tasks": [
    {
      "type": "fill",
      "mins": 1,
      "q": "Which shortcut creates a **new blank workbook**?",
      "accept": [
        "Ctrl+N"
      ],
      "acceptRegex": [
        "^\\s*(ctrl|control)\\s*\\+\\s*N\\s*$"
      ],
      "explain": "**Ctrl + N** (New) opens a fresh blank workbook immediately. File > New also lets you pick a template."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Which **function key** opens the **Save As** dialog directly?",
      "accept": [
        "F12"
      ],
      "explain": "**F12** opens Save As, where you can choose a new name, folder or file type. **Ctrl + S** only saves the current file (it opens Save As only the first time)."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Your workbook contains **macros**. Which file extension must you use so that the macros are kept?",
      "options": [
        ".xlsx",
        ".xlsm",
        ".csv",
        ".xls"
      ],
      "answer": 1,
      "explain": "**.xlsm** = macro-enabled workbook. If you save a file with macros as **.xlsx**, Excel warns you and the VBA code is removed. .csv keeps only plain values of one sheet."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "You save a workbook with 3 sheets, formatting and formulas as **.csv**. What is kept?",
      "options": [
        "Everything: all sheets, formatting and formulas",
        "Only the values of the active sheet, as plain text",
        "All sheets but no formatting",
        "Only the formulas"
      ],
      "answer": 1,
      "explain": "**CSV** (Comma-Separated Values) is a plain-text format: it stores only the **values of the active sheet**, separated by commas. Formatting, formulas, charts and other sheets are lost, so keep a .xlsx master copy."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which shortcuts **close the current workbook** but keep Excel open? (choose all that apply)",
      "options": [
        "Ctrl+W",
        "Ctrl+F4",
        "Alt+F4",
        "Ctrl+S"
      ],
      "answers": [
        0,
        1
      ],
      "explain": "**Ctrl + W** and **Ctrl + F4** close the active workbook only. **Alt + F4** closes the whole Excel window. Ctrl + S saves; it does not close anything."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "What is the main difference between **Save** and **Save As**?",
      "options": [
        "There is no difference",
        "Save As creates a copy with a new name/location/format; Save updates the current file",
        "Save works only for .csv files",
        "Save As deletes the old file"
      ],
      "answer": 1,
      "explain": "**Save** overwrites the same file. **Save As** lets you choose a **new name, folder or type** (e.g. a copy named `Sales_v2.xlsx` or a PDF). The original file stays as it was when last saved."
    }
  ]
};
