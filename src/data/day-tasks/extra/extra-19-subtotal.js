// Day Task (auto-graded practice) for extra-19-subtotal
export default {
  "lesson": "extra-19-subtotal",
  "minutes": 18,
  "intro": "Calculate totals, counts and averages that respect filters with SUBTOTAL() and its function numbers.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "What is the difference between `SUBTOTAL(9, ...)` and `SUBTOTAL(109, ...)`?",
      "options": [
        "9 is SUM, 109 is AVERAGE",
        "Both ignore rows hidden by a filter; 109 also ignores rows hidden manually (Hide Rows)",
        "109 includes hidden rows",
        "There is no difference"
      ],
      "answer": 1,
      "explain": "Both are SUM. **1-11** ignore filtered-out rows but include manually hidden rows; **101-111** ignore both. Every SUBTOTAL ignores other SUBTOTAL formulas inside its range."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Which **function_num** makes SUBTOTAL count the **non-empty** cells (like COUNTA) of the visible rows? (give the 1-11 number)",
      "accept": [
        "3",
        "103"
      ],
      "explain": "The table: 1 AVERAGE, 2 COUNT, **3 COUNTA**, 4 MAX, 5 MIN, 6 PRODUCT, 7 STDEV, 8 STDEVP, **9 SUM**, 10 VAR, 11 VARP. Use 3 (or 103) for visible serial numbers and record counts."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "The list is **filtered to Region = North**. Write a formula that gives the value `=SUBTOTAL(9, D2:D8)` would show now (the practice sheet cannot filter, so use the region as a condition).",
      "example": {
        "title": "what a filtered total contains",
        "code": "=SUMIF(C2:C50,\"Mumbai\",E2:E50)"
      },
      "grid": {
        "A1": "Date",
        "B1": "Region",
        "C1": "Product",
        "D1": "Sales",
        "A2": "01-Apr",
        "B2": "North",
        "C2": "Fan",
        "D2": "12000",
        "A3": "02-Apr",
        "B3": "South",
        "C3": "Cooler",
        "D3": "18500",
        "A4": "03-Apr",
        "B4": "North",
        "C4": "Cooler",
        "D4": "21000",
        "A5": "04-Apr",
        "B5": "West",
        "C5": "Fan",
        "D5": "9500",
        "A6": "05-Apr",
        "B6": "North",
        "C6": "AC",
        "D6": "46000",
        "A7": "06-Apr",
        "B7": "South",
        "C7": "Fan",
        "D7": "11200",
        "A8": "07-Apr",
        "B8": "West",
        "C8": "AC",
        "D8": "52000"
      },
      "starter": "",
      "solution": "=SUMIF(B2:B8,\"North\",D2:D8)",
      "explain": "Only the North rows are visible: 12,000 + 21,000 + 46,000 = **79,000**. A plain `=SUM(D2:D8)` would still show 170,200 because SUM includes hidden rows; that is why totals under filtered data must use SUBTOTAL."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "With the same **North** filter, what would `=SUBTOTAL(1, D2:D8)` (AVERAGE of visible rows) show? Write it with a conditional average.",
      "example": {
        "title": "conditional average",
        "code": "=AVERAGEIF(A2:A40,\"Pune\",D2:D40)"
      },
      "grid": {
        "A1": "Date",
        "B1": "Region",
        "C1": "Product",
        "D1": "Sales",
        "A2": "01-Apr",
        "B2": "North",
        "C2": "Fan",
        "D2": "12000",
        "A3": "02-Apr",
        "B3": "South",
        "C3": "Cooler",
        "D3": "18500",
        "A4": "03-Apr",
        "B4": "North",
        "C4": "Cooler",
        "D4": "21000",
        "A5": "04-Apr",
        "B5": "West",
        "C5": "Fan",
        "D5": "9500",
        "A6": "05-Apr",
        "B6": "North",
        "C6": "AC",
        "D6": "46000",
        "A7": "06-Apr",
        "B7": "South",
        "C7": "Fan",
        "D7": "11200",
        "A8": "07-Apr",
        "B8": "West",
        "C8": "AC",
        "D8": "52000"
      },
      "starter": "",
      "solution": "=AVERAGEIF(B2:B8,\"North\",D2:D8)",
      "explain": "Function 1 = AVERAGE of visible cells: 79,000 ÷ 3 ≈ **26,333.33**. AVERAGE(D2:D8) would wrongly average all 7 rows."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "The data has SUBTOTAL rows after every region, and a grand total `=SUBTOTAL(9, D2:D30)` covers the whole column. Is anything counted twice?",
      "options": [
        "Yes, the region subtotals are added again",
        "No, SUBTOTAL ignores other SUBTOTAL results inside its range",
        "Only if the rows are hidden",
        "Only with function 109"
      ],
      "answer": 1,
      "explain": "SUBTOTAL skips cells that themselves contain SUBTOTAL formulas, so the grand total is correct without picking ranges carefully. `=SUM(D2:D30)` would double count."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which actions insert or produce SUBTOTAL formulas automatically? (choose all that apply)",
      "options": [
        "Turning on the Total Row of an Excel Table",
        "Pressing Alt + = (AutoSum) below a filtered list",
        "Data > Outline > Subtotal",
        "Pressing Ctrl + Shift + L",
        "Typing =SUM in a cell"
      ],
      "answers": [
        0,
        1,
        2
      ],
      "explain": "Table Total Row uses `SUBTOTAL(109, ...)`, AutoSum on a filtered list writes `SUBTOTAL(9, ...)`, and **Data > Subtotal** inserts subtotal rows per group. Ctrl+Shift+L only toggles filters."
    }
  ]
};
