// Day Task (auto-graded practice) for day-59-protection-print-page-layout
export default {
  "lesson": "day-59-protection-print-page-layout",
  "minutes": 20,
  "intro": "Protect cells, sheets and workbooks, and set up page layout so reports print neatly with titles and page numbers.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "You protect a sheet but users must still be able to type in the **input cells** (B2:B10). What must you do **before** protecting?",
      "options": [
        "Hide B2:B10",
        "Unlock B2:B10 (Format Cells > Protection > untick Locked)",
        "Merge B2:B10",
        "Nothing"
      ],
      "answer": 1,
      "explain": "All cells are **Locked** by default, but locking only works after **Review > Protect Sheet**. Unlock the input cells first; then protect the sheet so only formulas and labels are locked."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Which option stops users from **adding, deleting, renaming or moving sheets**?",
      "options": [
        "Protect Sheet",
        "Protect Workbook (Structure)",
        "Mark as Final",
        "Allow Edit Ranges"
      ],
      "answer": 1,
      "explain": "**Review > Protect Workbook** (Structure) protects the sheet structure. Protect Sheet protects the cells on one sheet. For a password to open the file, use File > Info > Protect Workbook > Encrypt with Password."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "To keep the formulas secret (the Formula Bar shows nothing), tick ______ in Format Cells > Protection and then protect the sheet.",
      "options": [
        "Locked",
        "Hidden",
        "Wrap Text",
        "Shrink to fit"
      ],
      "answer": 1,
      "explain": "**Hidden** hides the formula in the Formula Bar once the sheet is protected. The result still shows in the cell."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "A long report prints on 6 pages but the header row appears only on page 1. What should you set?",
      "options": [
        "Print Area",
        "Print Titles > Rows to repeat at top",
        "Orientation",
        "Margins"
      ],
      "answer": 1,
      "explain": "**Page Layout > Page Setup > Print Titles > Rows to repeat at top** (e.g. $1:$1) prints the header row on every page."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Which shortcut opens **Print / Print Preview** (File > Print)?",
      "accept": [
        "Ctrl+P"
      ],
      "acceptRegex": [
        "^\\s*(ctrl|control)\\s*\\+\\s*P\\s*$",
        "^\\s*(ctrl|control)\\s*\\+\\s*F2\\s*$"
      ],
      "explain": "**Ctrl + P** opens Backstage Print with the preview, printer, page settings and scaling options such as \"Fit All Columns on One Page\"."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which are valid header/footer codes or elements you can insert? (choose all that apply)",
      "options": [
        "Page Number",
        "Number of Pages",
        "Current Date",
        "File Name",
        "Cell formula result of A1"
      ],
      "answers": [
        0,
        1,
        2,
        3
      ],
      "explain": "Header & Footer elements include **Page Number (&[Page]), Number of Pages (&[Pages]), Current Date, Current Time, File Path, File Name, Sheet Name** and Picture. A cell value cannot be inserted directly without VBA."
    }
  ]
};
