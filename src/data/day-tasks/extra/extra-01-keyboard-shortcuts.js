// Day Task (auto-graded practice) for extra-01-keyboard-shortcuts
export default {
  "lesson": "extra-01-keyboard-shortcuts",
  "minutes": 15,
  "intro": "Practise the navigation, selection, editing and formula shortcuts that make office Excel work 2-3 times faster.",
  "tasks": [
    {
      "type": "fill",
      "mins": 1,
      "q": "You are in cell A1 of a 50,000-row sales sheet. Which shortcut jumps straight to the **last used cell** (bottom-right corner of the data)?",
      "accept": [
        "Ctrl+End"
      ],
      "acceptRegex": [
        "^\\s*(ctrl|control)\\s*\\+\\s*End\\s*$"
      ],
      "explain": "**Ctrl + End** goes to the last used cell of the sheet, **Ctrl + Home** goes back to A1. Ctrl + Down Arrow only jumps to the end of the current block of data in one column."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Cell B2 has a formula. You select B2:B200 and want to copy the formula **down** in one keystroke. Which shortcut?",
      "accept": [
        "Ctrl+D"
      ],
      "acceptRegex": [
        "^\\s*(ctrl|control)\\s*\\+\\s*D\\s*$"
      ],
      "explain": "**Ctrl + D** (Fill Down) copies the top cell of the selection into all cells below. **Ctrl + R** (Fill Right) does the same to the right. Many people drag the fill handle instead, which is slow on long lists."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "While typing an address in one cell you press **Alt + Enter**. What happens?",
      "options": [
        "The entry is confirmed and the cursor moves down",
        "A new line starts inside the same cell",
        "The same entry is filled into all selected cells",
        "An AutoSum formula is inserted"
      ],
      "answer": 1,
      "explain": "**Alt + Enter** inserts a line break inside the cell (Wrap Text turns on automatically). **Ctrl + Enter** fills the same entry into every selected cell, and plain Enter just confirms and moves down."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which of these shortcut pairs are **correct**? (choose all that apply)",
      "options": [
        "Ctrl+1 = Format Cells dialog",
        "Ctrl+Shift+L = Turn AutoFilter on/off",
        "Ctrl+; = Insert today's date",
        "Ctrl+Shift+% = Percent format",
        "Ctrl+T = Format as Table",
        "Ctrl+Space = Select the whole row"
      ],
      "answers": [
        0,
        1,
        2,
        3,
        4
      ],
      "explain": "All are right except the last one: **Ctrl + Space** selects the whole **column**, and **Shift + Space** selects the whole **row**. Students often swap these two."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "While editing the formula `=B2*F1`, you click on `F1` in the formula bar and press one key to change it to `$F$1`. Which key?",
      "accept": [
        "F4"
      ],
      "explain": "**F4** cycles a reference through `$F$1` → `F$1` → `$F1` → `F1`. It is the fastest way to lock a reference before copying a formula down."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "You select **B7** (just below the sales figures) and press **Alt + =** (AutoSum). Type the formula that AutoSum inserts, so B7 shows the week total.",
      "example": {
        "title": "AutoSum on a column",
        "text": "With A2:A4 holding numbers and A5 selected, Alt + = inserts:",
        "code": "=SUM(A2:A4)"
      },
      "grid": {
        "A1": "Day",
        "B1": "Sales (₹)",
        "A2": "Mon",
        "B2": "12500",
        "A3": "Tue",
        "B3": "9800",
        "A4": "Wed",
        "B4": "14250",
        "A5": "Thu",
        "B5": "11000",
        "A6": "Fri",
        "B6": "16400"
      },
      "starter": "",
      "solution": "=SUM(B2:B6)",
      "explain": "**Alt + =** inserts `=SUM(...)` and guesses the range of numbers directly above (or to the left). Here it picks **B2:B6** → 63,950. Always check the guessed range: AutoSum stops at the first blank cell."
    }
  ]
};
