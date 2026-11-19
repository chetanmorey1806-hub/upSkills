// Day Task (auto-graded practice) for extra-07-paste-special
export default {
  "lesson": "extra-07-paste-special",
  "minutes": 18,
  "intro": "Paste only what you need (values, formats, widths) and do maths while pasting with Paste Special.",
  "tasks": [
    {
      "type": "fill",
      "mins": 1,
      "q": "Which shortcut opens the **Paste Special** dialog?",
      "accept": [
        "Ctrl+Alt+V"
      ],
      "acceptRegex": [
        "^\\s*(ctrl|control)\\s*\\+\\s*Alt\\s*\\+\\s*V\\s*$"
      ],
      "explain": "**Ctrl + Alt + V** opens Paste Special. Then press the underlined letter: **V** = Values, **T** = Formats, **F** = Formulas, **W** = Column widths, **E** = Transpose."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "You copied a column of formulas from a report and want to send only the **numbers** (no formulas) to the client. Which option?",
      "options": [
        "Formulas",
        "Values",
        "Formats",
        "Paste Link"
      ],
      "answer": 1,
      "explain": "**Values** pastes the current results only, so the client never sees your formulas or broken links. Shortcut: Ctrl + Alt + V, V, Enter."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "All prices in B2:B200 must go up by **10%**. Without any helper column, what do you do?",
      "options": [
        "Type 10% in a cell, copy it, select B2:B200, Paste Special > Add",
        "Type 1.1 in a cell, copy it, select B2:B200, Paste Special > Multiply",
        "Type 1.1 in a cell, copy it, select B2:B200, Paste Special > Values",
        "Select B2:B200 and press Ctrl+D"
      ],
      "answer": 1,
      "explain": "Paste Special **Multiply** multiplies every selected cell by the copied value: price × 1.1 = 10% increase. Adding 10% (0.1) would add only ₹0.10 to each price, a classic mistake."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "A colleague will paste **100000** (copied from E1) onto C2:C5 using **Paste Special > Divide** so the amounts show in lakhs. Write a formula that gives the value **C4** will contain after that operation.",
      "example": {
        "title": "Paste Special maths",
        "text": "Copying 2 and using Paste Special > Multiply on a cell containing 450 leaves:",
        "code": "=450*2"
      },
      "grid": {
        "A1": "Branch",
        "B1": "Region",
        "C1": "Revenue (₹)",
        "E1": "100000",
        "A2": "Pune",
        "B2": "West",
        "C2": "2450000",
        "A3": "Nashik",
        "B3": "West",
        "C3": "1875000",
        "A4": "Surat",
        "B4": "West",
        "C4": "3120000",
        "A5": "Indore",
        "B5": "Central",
        "C5": "960000"
      },
      "starter": "",
      "solution": "=C4/E1",
      "explain": "Divide replaces each cell with **cell ÷ copied value**: 3,120,000 ÷ 100,000 = **31.2** lakh. Note the original numbers are overwritten; keep a backup or do it in a copy."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Match the Paste Special options to what they do. Which are **correct**? (choose all that apply)",
      "options": [
        "Skip Blanks = blank cells in the copied range do not overwrite existing data",
        "Transpose = rows become columns and columns become rows",
        "Paste Link = creates formulas like =Sheet1!B2 that stay linked to the source",
        "Column widths = copies values and widths together",
        "Formats = copies only formatting (like Format Painter)"
      ],
      "answers": [
        0,
        1,
        2,
        4
      ],
      "explain": "**Column widths** copies only the widths, no values. Skip Blanks protects existing data, Transpose flips the layout, Paste Link creates live references and Formats copies only the look."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Numbers imported from a portal are stored as **text** (green triangles), so SUM gives 0. Which Paste Special trick converts them to real numbers?",
      "options": [
        "Copy a blank cell, select the text-numbers, Paste Special > Add",
        "Paste Special > Formats",
        "Paste Special > Comments",
        "Paste Special > Skip Blanks"
      ],
      "answer": 0,
      "explain": "Adding 0 (a blank cell) or multiplying by 1 forces Excel to calculate each cell, which turns text-numbers into **real numbers**. Formats only changes the look, not the data type."
    }
  ]
};
