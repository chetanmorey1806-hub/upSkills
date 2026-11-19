// Day Task (auto-graded practice) for day-53-consolidate-subtotal-group
export default {
  "lesson": "day-53-consolidate-subtotal-group",
  "minutes": 25,
  "intro": "Combine data with Consolidate, add group totals with Subtotal/SUBTOTAL(), and collapse rows with Group & Outline.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "Where is the **Consolidate** command?",
      "options": [
        "Data > Data Tools > Consolidate",
        "Home > Editing > Consolidate",
        "Insert > Consolidate",
        "Formulas > Consolidate"
      ],
      "answer": 0,
      "explain": "**Data > Data Tools > Consolidate**. Choose the function (Sum), add each source range, tick Top row / Left column to consolidate by labels, and optionally \"Create links to source data\"."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Before using **Data > Outline > Subtotal** \"At each change in: Category\", what must you do?",
      "options": [
        "Sort the data by Category",
        "Delete blank columns",
        "Convert to a Table",
        "Nothing"
      ],
      "answer": 0,
      "explain": "Subtotal inserts a total row each time the value **changes**, so the data must be **sorted** by that column first; otherwise you get many small subtotals for the same category."
    },
    {
      "type": "output",
      "mins": 2,
      "q": "A2:A6 = 10, 20, 30, 40, 50. Rows 3 and 4 are **hidden manually**. What does `=SUBTOTAL(109,A2:A6)` return?",
      "code": "=SUBTOTAL(109,A2:A6)",
      "expected": "100",
      "explain": "Function number **109** = SUM that **ignores manually hidden rows** (9 ignores only filtered-out rows). Visible: 10 + 40 + 50 = **100**."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Which shortcut **groups** the selected rows (adds an outline level)?",
      "accept": [
        "Alt+Shift+Right"
      ],
      "acceptRegex": [
        "^\\s*alt\\s*\\+\\s*shift\\s*\\+\\s*(right|right arrow|→)\\s*$",
        "^\\s*shift\\s*\\+\\s*alt\\s*\\+\\s*(right|right arrow|→)\\s*$"
      ],
      "explain": "**Alt + Shift + Right Arrow** groups; **Alt + Shift + Left Arrow** ungroups (Data > Outline > Group/Ungroup)."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Consolidate by category: what is the total **Grocery** sales of all branches?",
      "example": {
        "title": "total per category",
        "code": "=SUMIF(B2:B50, \"Footwear\", C2:C50)"
      },
      "grid": {
        "A1": "Branch",
        "B1": "Category",
        "C1": "Sales",
        "A2": "Pune",
        "B2": "Grocery",
        "C2": "45000",
        "A3": "Pune",
        "B3": "Clothing",
        "C3": "28000",
        "A4": "Nashik",
        "B4": "Grocery",
        "C4": "31000",
        "A5": "Nashik",
        "B5": "Clothing",
        "C5": "19500",
        "A6": "Nagpur",
        "B6": "Grocery",
        "C6": "38500",
        "A7": "Nagpur",
        "B7": "Footwear",
        "C7": "12000"
      },
      "starter": "",
      "solution": "=SUMIF(B2:B7,\"Grocery\",C2:C7)",
      "explain": "45000 + 31000 + 38500 = **114500**. Consolidate by labels (Left column) gives the same total per category."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "After Subtotal, you click outline level **2**. What do you see?",
      "options": [
        "Only the grand total",
        "Subtotal rows and the grand total (details hidden)",
        "All detail rows",
        "Nothing"
      ],
      "answer": 1,
      "explain": "Level **1** = grand total only, level **2** = subtotals + grand total, level **3** = all details. To copy only the visible summary rows use Go To Special > **Visible cells only** (Alt + ;)."
    }
  ]
};
