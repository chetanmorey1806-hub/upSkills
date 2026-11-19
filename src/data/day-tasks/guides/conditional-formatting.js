// Day Task (auto-graded practice) for conditional-formatting
export default {
  "lesson": "conditional-formatting",
  "minutes": 18,
  "intro": "Revise highlight rules, data bars, icon sets and formula-based rules for whole rows, with correct $ anchoring.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "You select **A2:F100** and create a formula rule to highlight the **whole row** when Status (column F) is \"Pending\". Which formula is correct?",
      "options": [
        "=F2=\"Pending\"",
        "=$F2=\"Pending\"",
        "=$F$2=\"Pending\"",
        "=F$2=\"Pending\""
      ],
      "answer": 1,
      "explain": "`$F2`: the column is locked so every cell of the row checks column F, and the row is relative so each row checks its own status. `$F$2` would colour all rows based only on row 2."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Test the rule before applying it: write the formula a rule would use for **row 4** to highlight orders where Status is **\"Pending\"** AND Amount is **above 10000**. It must return TRUE or FALSE.",
      "example": {
        "title": "a rule formula returns TRUE/FALSE",
        "code": "=AND($C2=\"Pune\",$E2>=50000)"
      },
      "grid": {
        "A1": "Order",
        "B1": "City",
        "C1": "Product",
        "D1": "Qty",
        "E1": "Amount",
        "F1": "Status",
        "A2": "1001",
        "B2": "Pune",
        "C2": "Fan",
        "D2": "2",
        "E2": "3600",
        "F2": "Delivered",
        "A3": "1002",
        "B3": "Mumbai",
        "C3": "Cooler",
        "D3": "1",
        "E3": "8900",
        "F3": "Pending",
        "A4": "1003",
        "B4": "Pune",
        "C4": "AC",
        "D4": "1",
        "E4": "36500",
        "F4": "Delivered",
        "A5": "1004",
        "B5": "Nagpur",
        "C5": "Fan",
        "D5": "3",
        "E5": "5400",
        "F5": "Cancelled",
        "A6": "1005",
        "B6": "Mumbai",
        "C6": "AC",
        "D6": "2",
        "E6": "71000",
        "F6": "Delivered",
        "A7": "1006",
        "B7": "Pune",
        "C7": "Cooler",
        "D7": "2",
        "E7": "17800",
        "F7": "Pending"
      },
      "starter": "",
      "solution": "=AND($F7=\"Pending\",$E7>10000)",
      "explain": "Row 7 is order 1006 (Pending, 17,800), so the result is **TRUE** and the row would be highlighted. Writing the rule in a cell first and copying it down is the best way to debug conditional formatting formulas."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Which built-in option highlights the top 10% of values without writing a formula?",
      "options": [
        "Data Bars",
        "Top/Bottom Rules > Top 10%",
        "Highlight Cells Rules > Greater Than",
        "Icon Sets"
      ],
      "answer": 1,
      "explain": "**Home > Conditional Formatting > Top/Bottom Rules > Top 10%** (the % and the count can be changed). Greater Than needs a fixed number that you would have to update."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Two rules apply to the same cell: rule 1 (green fill if > 50000) and rule 2 (red fill if > 10000). The value is 60000 and \"Stop If True\" is ticked on rule 1. What do you see?",
      "options": [
        "Red fill",
        "Green fill only",
        "Both colours mixed",
        "No fill"
      ],
      "answer": 1,
      "explain": "Rules are evaluated from the **top** of the Rules Manager list. Rule 1 is TRUE and **Stop If True** prevents lower rules from running → green only."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "A rule should highlight **duplicate** order cities. Write the formula the rule would use for **B3** (TRUE when the city in B3 appears more than once in B2:B7).",
      "example": {
        "title": "duplicate test with COUNTIF",
        "code": "=COUNTIF($A$2:$A$500,A2)>1"
      },
      "grid": {
        "A1": "Order",
        "B1": "City",
        "C1": "Product",
        "D1": "Qty",
        "E1": "Amount",
        "F1": "Status",
        "A2": "1001",
        "B2": "Pune",
        "C2": "Fan",
        "D2": "2",
        "E2": "3600",
        "F2": "Delivered",
        "A3": "1002",
        "B3": "Mumbai",
        "C3": "Cooler",
        "D3": "1",
        "E3": "8900",
        "F3": "Pending",
        "A4": "1003",
        "B4": "Pune",
        "C4": "AC",
        "D4": "1",
        "E4": "36500",
        "F4": "Delivered",
        "A5": "1004",
        "B5": "Nagpur",
        "C5": "Fan",
        "D5": "3",
        "E5": "5400",
        "F5": "Cancelled",
        "A6": "1005",
        "B6": "Mumbai",
        "C6": "AC",
        "D6": "2",
        "E6": "71000",
        "F6": "Delivered",
        "A7": "1006",
        "B7": "Pune",
        "C7": "Cooler",
        "D7": "2",
        "E7": "17800",
        "F7": "Pending"
      },
      "starter": "",
      "solution": "=COUNTIF($B$2:$B$7,B3)>1",
      "explain": "Mumbai appears twice, so the result is **TRUE**. The range is absolute (same list for every cell) and B3 is relative (each cell checks itself)."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which are **visual** formats that show the size of a value inside the cell? (choose all that apply)",
      "options": [
        "Data Bars",
        "Color Scales",
        "Icon Sets",
        "Highlight Duplicate Values",
        "Text that Contains"
      ],
      "answers": [
        0,
        1,
        2
      ],
      "explain": "Data Bars, Color Scales and Icon Sets show magnitude. Duplicate Values and Text that Contains are highlight rules (yes/no)."
    }
  ]
};
