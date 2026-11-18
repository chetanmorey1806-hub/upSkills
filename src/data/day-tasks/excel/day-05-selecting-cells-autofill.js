// Day Task (auto-graded practice) for day-05-selecting-cells-autofill
export default {
  "lesson": "day-05-selecting-cells-autofill",
  "minutes": 15,
  "intro": "Practise fast selection with mouse and keyboard and create series with AutoFill.",
  "tasks": [
    {
      "type": "fill",
      "mins": 1,
      "q": "Which key do you **hold** to select several **non-adjacent** ranges (e.g. A1:A5 and C1:C5)?",
      "accept": [
        "Ctrl",
        "Control"
      ],
      "explain": "Select the first range, then hold **Ctrl** and drag the next one. **Shift** extends one continuous range instead."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Which shortcut selects the **entire column** of the active cell?",
      "accept": [
        "Ctrl+Space",
        "Ctrl+Spacebar"
      ],
      "acceptRegex": [
        "^\\s*(ctrl|control)\\s*\\+\\s*Space\\s*$",
        "^\\s*(ctrl|control)\\s*\\+\\s*Spacebar\\s*$"
      ],
      "explain": "**Ctrl + Space** selects the whole column; **Shift + Space** selects the whole row; **Ctrl + A** selects the current data region / whole sheet."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "A1 has **1** and A2 has **3**. You select both and drag the fill handle down to A5. What is in A5?",
      "options": [
        "5",
        "7",
        "9",
        "1"
      ],
      "answer": 2,
      "explain": "With two cells selected, AutoFill continues the **step** between them: 1, 3, 5, 7, **9**. With only one number selected, Excel would just copy it (unless you use Fill Series)."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "You type **Jan** in B1 and drag the fill handle right to E1. What does E1 show?",
      "options": [
        "Jan",
        "Feb",
        "Apr",
        "May"
      ],
      "answer": 2,
      "explain": "Excel knows month names as a built-in list: Jan, Feb, Mar, **Apr**. B1 to E1 is four cells. Same for days (Mon, Tue...)."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Where is the **Series** dialog (to fill a series with a step value and stop value)?",
      "options": [
        "Insert > Series",
        "Home > Editing > Fill > Series",
        "Data > Series",
        "View > Fill"
      ],
      "answer": 1,
      "explain": "**Home > Editing > Fill > Series** lets you set Rows/Columns, Linear/Growth/Date type, **Step value** and **Stop value**, e.g. invoice numbers 1001 to 1100."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "D2 should show the amount for the first item. Write the formula (Qty x Rate). Later you would AutoFill it down for the other rows.",
      "example": {
        "title": "formula for one row",
        "code": "=B5*C5"
      },
      "grid": {
        "A1": "Item",
        "B1": "Qty",
        "C1": "Rate",
        "D1": "Amount",
        "A2": "Pen",
        "B2": "20",
        "C2": "10",
        "A3": "Pencil",
        "B3": "35",
        "C3": "5"
      },
      "starter": "",
      "solution": "=B2*C2",
      "explain": "Write the formula once in D2 (`=B2*C2`) and double-click or drag the fill handle: Excel changes it to `=B3*C3` in the next row automatically. That is why we use references, not typed numbers."
    }
  ]
};
