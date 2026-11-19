// Day Task (auto-graded practice) for extra-08-transpose-data
export default {
  "lesson": "extra-08-transpose-data",
  "minutes": 15,
  "intro": "Flip rows into columns with Paste Special > Transpose, the TRANSPOSE() function and Power Query.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "Which is the **static** way to transpose a range (the result does not update when the source changes)?",
      "options": [
        "=TRANSPOSE(A1:D3)",
        "Copy > Paste Special > Transpose (Ctrl+Alt+V, E)",
        "Power Query > Transform > Transpose",
        "Data > Text to Columns"
      ],
      "answer": 1,
      "explain": "**Paste Special > Transpose** pastes a one-time flipped copy. `=TRANSPOSE()` is live (spills and updates) and Power Query Transpose updates on **Refresh**."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "`=TRANSPOSE(A1:D3)` is entered in F1. How big is the spilled result?",
      "options": [
        "3 rows × 4 columns",
        "4 rows × 3 columns",
        "4 rows × 4 columns",
        "1 row × 12 columns"
      ],
      "answer": 1,
      "explain": "A1:D3 has **3 rows and 4 columns**, so the transposed result has **4 rows and 3 columns**. Count the space before entering it, otherwise you get #SPILL!."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Monthly sales are in **A1:E3** (row 1 = months, rows 2-3 = regions). If you entered `=TRANSPOSE(A1:E3)`, which value would appear in **row 4, column 3** of the result? Return it with an **INDEX** formula on the original range.",
      "example": {
        "title": "INDEX picks a row and column",
        "code": "=INDEX(B2:D5,2,3)   → 2nd row, 3rd column of B2:D5"
      },
      "grid": {
        "A1": "Region",
        "B1": "Apr",
        "C1": "May",
        "D1": "Jun",
        "E1": "Jul",
        "A2": "North",
        "B2": "52000",
        "C2": "48500",
        "D2": "61000",
        "E2": "57300",
        "A3": "South",
        "B3": "44800",
        "C3": "50200",
        "D3": "46900",
        "E3": "53100"
      },
      "starter": "",
      "solution": "=INDEX(A1:E3,3,4)",
      "explain": "Transposing swaps positions: result **row r, column c** = source **row c, column r**. So result (4, 3) = source (3, 4) = South in Jun = **46,900**. The swap of row/column numbers is exactly what TRANSPOSE does."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which statements are **TRUE**? (choose all that apply)",
      "options": [
        "=TRANSPOSE() updates automatically when the source changes",
        "Paste Special > Transpose cannot paste onto a range that overlaps the copied range",
        "In Microsoft 365 TRANSPOSE spills; in Excel 2019 and older it needs Ctrl+Shift+Enter over a pre-selected range",
        "Power Query Transpose updates only when you click Refresh",
        "You can delete one cell from the middle of a TRANSPOSE spill range"
      ],
      "answers": [
        0,
        1,
        2,
        3
      ],
      "explain": "A spilled result is one unit: you can only edit or delete the **anchor** formula. The other statements are the key differences between the three methods."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "You enter `=TRANSPOSE(A1:E3)` but one cell in the destination area already has text. What does Excel show?",
      "options": [
        "#VALUE!",
        "#SPILL!",
        "#REF!",
        "It overwrites the text"
      ],
      "answer": 1,
      "explain": "A dynamic array never overwrites data: it shows **#SPILL!** until the blocking cell is cleared. Click the error icon > Select Obstructing Cells to find it."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "In the Power Query Editor, on which tab is the **Transpose** button?",
      "accept": [
        "Transform",
        "Transform tab"
      ],
      "explain": "**Transform > Table > Transpose**. After transposing, use **Use First Row as Headers** because the old row labels have become the first row."
    }
  ]
};
