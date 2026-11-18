// Day Task (auto-graded practice) for day-09-rows-columns-insert-delete-hide
export default {
  "lesson": "day-09-rows-columns-insert-delete-hide",
  "minutes": 15,
  "intro": "Resize, insert, delete, hide and unhide rows and columns, and see how formulas react.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "How do you **AutoFit** a column to its longest entry quickly?",
      "options": [
        "Double-click the right border of the column header",
        "Press F2",
        "Right-click > Hide",
        "Ctrl + T"
      ],
      "answer": 0,
      "explain": "Double-click the **right border** of the column header (or Home > Cells > Format > AutoFit Column Width). Excel resizes the column to fit the widest content. ##### in a cell often means the column is too narrow."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Which shortcut **inserts** rows/columns/cells (opens the Insert dialog or inserts the selected rows)?",
      "accept": [
        "Ctrl+Shift+=",
        "Ctrl++",
        "Ctrl+Shift++"
      ],
      "acceptRegex": [
        "^\\s*(ctrl|control)\\s*\\+\\s*(shift\\s*\\+\\s*)?(\\+|=|plus)\\s*$"
      ],
      "explain": "**Ctrl + Shift + =** (Ctrl + + on the number pad) inserts. **Ctrl + -** deletes. Select whole rows first to insert entire rows without the dialog."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Which shortcut **hides the selected rows**?",
      "accept": [
        "Ctrl+9"
      ],
      "acceptRegex": [
        "^\\s*(ctrl|control)\\s*\\+\\s*9\\s*$"
      ],
      "explain": "**Ctrl + 9** hides rows, **Ctrl + 0** hides columns. Ctrl + Shift + 9 unhides rows. Hiding is not deleting: hidden values are still used in formulas."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "B5 has `=SUM(B2:B4)`. You **insert a new row** between row 2 and row 3. What does the formula (now in B6) become?",
      "options": [
        "=SUM(B2:B4)",
        "=SUM(B2:B5)",
        "=SUM(B3:B5)",
        "#REF!"
      ],
      "answer": 1,
      "explain": "When you insert rows **inside** a referenced range, Excel expands the range automatically: `=SUM(B2:B5)`. Inserting rows **below** the last row of the range does not expand it, a classic source of wrong totals."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "B5 has `=B2+B3+B4`. You **delete row 3**. What does the formula show?",
      "options": [
        "The sum of the remaining cells",
        "#REF!",
        "0",
        "#VALUE!"
      ],
      "answer": 1,
      "explain": "The direct reference to the deleted cell is lost, so the formula becomes `=B2+#REF!+B3` and shows **#REF!**. A range like `=SUM(B2:B4)` would simply shrink, which is one reason to prefer ranges."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Rows 3 and 4 (Feb and Mar) are **hidden**, but the data is still there. Write a formula for the **total** of all four months B2:B5. (Hidden rows are still included.)",
      "example": {
        "title": "total of a range",
        "code": "=SUM(C2:C8)"
      },
      "grid": {
        "A1": "Month",
        "B1": "Expense",
        "A2": "Jan",
        "B2": "4500",
        "A3": "Feb",
        "B3": "3800",
        "A4": "Mar",
        "B4": "5200",
        "A5": "Apr",
        "B5": "4100"
      },
      "starter": "",
      "solution": "=SUM(B2:B5)",
      "explain": "Hiding rows only hides them from view; `=SUM(B2:B5)` still adds all four values = **17600**. If you need totals of visible rows only, you will learn SUBTOTAL/AGGREGATE later."
    }
  ]
};
