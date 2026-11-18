// Day Task (auto-graded practice) for day-10-borders-fill-format-painter
export default {
  "lesson": "day-10-borders-fill-format-painter",
  "minutes": 20,
  "intro": "Apply borders and fill colours, copy formats with Format Painter, and build a small formatted worksheet with totals.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "How do you use **Format Painter** to paste the same formatting on **several different places** one after another?",
      "options": [
        "Single-click it",
        "Double-click it (press Esc to stop)",
        "Right-click it",
        "Press Ctrl + P"
      ],
      "answer": 1,
      "explain": "**Double-click** the Format Painter brush to keep it on; click as many ranges as you need, then press **Esc**. A single click applies the format only once."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Which border is commonly used under a **grand total** row in accounting reports?",
      "options": [
        "Thick Box Border",
        "Bottom Double Border",
        "No Border",
        "Left Border"
      ],
      "answer": 1,
      "explain": "A **Bottom Double Border** under the total is the accounting convention for \"final figure\". It is in Home > Font > Borders drop-down."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which statements about **fill colour** are TRUE? (choose all that apply)",
      "options": [
        "It changes the background of the cell",
        "It changes the value in the cell",
        "It is on Home > Font > Fill Color (paint bucket)",
        "Format Cells > Fill tab also has patterns and gradients"
      ],
      "answers": [
        0,
        2,
        3
      ],
      "explain": "Fill colour is only formatting: it changes the **background**, never the value. Find it at Home > Font > Fill Color or Ctrl+1 > Fill (with Pattern Style and Fill Effects)."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Which shortcut applies an **outline border** around the selected range?",
      "accept": [
        "Ctrl+Shift+&",
        "Ctrl+Shift+7"
      ],
      "acceptRegex": [
        "^\\s*(ctrl|control)\\s*\\+\\s*Shift\\s*\\+\\s*&\\s*$",
        "^\\s*(ctrl|control)\\s*\\+\\s*Shift\\s*\\+\\s*7\\s*$"
      ],
      "explain": "**Ctrl + Shift + &** (Ctrl+Shift+7) adds an outline border; **Ctrl + Shift + _** removes borders."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Office stationery bill: D2 should show the **amount** for Pens (Qty x Rate).",
      "example": {
        "title": "row calculation",
        "code": "=B4*C4"
      },
      "grid": {
        "A1": "Item",
        "B1": "Qty",
        "C1": "Rate",
        "D1": "Amount",
        "A2": "Pens",
        "B2": "50",
        "C2": "12",
        "A3": "Files",
        "B3": "20",
        "C3": "35",
        "A4": "Stapler",
        "B4": "4",
        "C4": "150"
      },
      "starter": "",
      "solution": "=B2*C2",
      "explain": "Amount = Qty x Rate = `=B2*C2` = **600**. Write it once and fill it down; then format the amount column with borders and a currency format."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Same bill: write one formula for the **grand total** of the bill (sum of Qty x Rate for all three rows). You may multiply and add the cells directly.",
      "example": {
        "title": "adding two products",
        "code": "=B2*C2+B3*C3"
      },
      "grid": {
        "A1": "Item",
        "B1": "Qty",
        "C1": "Rate",
        "A2": "Pens",
        "B2": "50",
        "C2": "12",
        "A3": "Files",
        "B3": "20",
        "C3": "35",
        "A4": "Stapler",
        "B4": "4",
        "C4": "150"
      },
      "starter": "",
      "solution": "=B2*C2+B3*C3+B4*C4",
      "explain": "Grand total = 600 + 700 + 600 = **1900**. Multiplication happens before addition, so no brackets are needed. In a real sheet you would usually put each amount in column D and use `=SUM(D2:D4)`."
    }
  ]
};
