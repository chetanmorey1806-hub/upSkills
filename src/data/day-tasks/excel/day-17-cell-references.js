// Day Task (auto-graded practice) for day-17-cell-references
export default {
  "lesson": "day-17-cell-references",
  "minutes": 20,
  "intro": "Use relative, absolute ($A$1) and mixed references so one formula can be copied correctly.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "Which reference keeps **both** the column and the row fixed when copied?",
      "options": [
        "A1",
        "$A1",
        "A$1",
        "$A$1"
      ],
      "answer": 3,
      "explain": "**$A$1** is absolute: the `$` before the column locks the column and the `$` before the row locks the row."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Which **function key** cycles a selected reference through A1 → $A$1 → A$1 → $A1?",
      "accept": [
        "F4"
      ],
      "explain": "Click inside the reference in the formula bar and press **F4** to toggle reference types."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "C2 should calculate Neha's commission = Sales x the rate in **B6**. Write the formula so that it still works when copied down to C3 and C4 (lock the rate cell).",
      "example": {
        "title": "locking a constant",
        "code": "=C2*$F$1"
      },
      "grid": {
        "A1": "Salesperson",
        "B1": "Sales",
        "C1": "Commission",
        "A2": "Neha",
        "B2": "84000",
        "A3": "Arjun",
        "B3": "125000",
        "A4": "Pooja",
        "B4": "67000",
        "A6": "Rate",
        "B6": "0.05"
      },
      "starter": "",
      "solution": "=B2*$B$6",
      "explain": "`=B2*$B$6` = **4200**. When copied down, B2 becomes B3, B4 (relative) but $B$6 stays fixed. Without $, the copy in C3 would point to B7 (empty) and give 0. The grader checks the value; in your sheet the $ is what makes copying work."
    },
    {
      "type": "output",
      "mins": 2,
      "q": "C2 contains `=A2*$E$1`. It is copied to **D5**. What formula is in D5? (type it exactly, starting with =)",
      "code": "C2: =A2*$E$1",
      "expected": "=B5*$E$1",
      "explain": "Copying 1 column right and 3 rows down: relative A2 becomes **B5**; absolute $E$1 does not move. Result: **=B5*$E$1**."
    },
    {
      "type": "output",
      "mins": 2,
      "q": "B2 contains `=$A2*B$1`. It is copied to **C3**. What formula is in C3?",
      "code": "B2: =$A2*B$1",
      "expected": "=$A3*C$1",
      "explain": "Mixed references: `$A2` keeps column A but the row moves (2→3); `B$1` keeps row 1 but the column moves (B→C). Result: **=$A3*C$1**. This is how a multiplication table is built with one formula."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "A discount table: row 1 has discount rates (B1:D1), column A has prices (A2:A4). Write the formula for **B2** = price x rate. (In your sheet it should be copyable to the whole grid, e.g. `=$A2*B$1`.)",
      "example": {
        "title": "mixed references",
        "code": "=$A5*C$2"
      },
      "grid": {
        "A1": "Price",
        "B1": "0.05",
        "C1": "0.1",
        "D1": "0.15",
        "A2": "1000",
        "A3": "2500",
        "A4": "4000"
      },
      "starter": "",
      "solution": "=$A2*B$1",
      "explain": "`=$A2*B$1` = 1000 x 0.05 = **50**. `$A` locks the price column, `$1` locks the rate row, so one formula fills the whole table."
    }
  ]
};
