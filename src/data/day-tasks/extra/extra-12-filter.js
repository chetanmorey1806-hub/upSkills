// Day Task (auto-graded practice) for extra-12-filter
export default {
  "lesson": "extra-12-filter",
  "minutes": 20,
  "intro": "Return only the rows that meet conditions with FILTER(), using * for AND, + for OR and if_empty.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "In FILTER, how do you combine two conditions so that **both** must be true?",
      "options": [
        "(cond1) AND (cond2)",
        "(cond1)*(cond2)",
        "(cond1)+(cond2)",
        "AND(cond1, cond2)"
      ],
      "answer": 1,
      "explain": "Multiply the conditions: TRUE*TRUE = 1, any FALSE gives 0. **+** means OR. `AND()` does not work because it returns one single TRUE/FALSE for the whole array, not one per row."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Complete the formula so it shows **No orders** when nothing matches: `=FILTER(A2:D9, B2:B9=\"Central\", ______)` (type the third argument)",
      "accept": [
        "\"No orders\"",
        "'No orders'"
      ],
      "explain": "The third argument **if_empty** is returned when no row matches. Without it FILTER returns **#CALC!** (\"empty array\")."
    },
    {
      "type": "output",
      "mins": 2,
      "q": "What does this formula spill? Type each value on its own line, top to bottom.",
      "code": "  | A     | B      | C     | D\n1 | Order | Region | Rep   | Amount\n2 | O-101 | North  | Asha  | 42000\n3 | O-102 | South  | Ravi  | 18500\n4 | O-103 | North  | Imran | 7600\n5 | O-104 | East   | Meena | 26300\n6 | O-105 | West   | Kavya | 51200\n7 | O-106 | North  | Asha  | 12900\n8 | O-107 | South  | Rohit | 33400\n9 | O-108 | East   | Sneha | 9800\n\n=FILTER(C2:C9, D2:D9>30000)",
      "expected": "Asha\nKavya\nRohit",
      "explain": "Rows with Amount > 30,000 are O-101 (Asha, 42000), O-105 (Kavya, 51200) and O-107 (Rohit, 33400). FILTER keeps the **original order** of the rows."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "A FILTER report shows `=FILTER(A2:D9, (B2:B9=\"North\")*(D2:D9>10000))`. How many rows will it return? Write a **COUNTIFS** formula that gives that number (the practice sheet does not support FILTER).",
      "example": {
        "title": "COUNTIFS with two conditions",
        "code": "=COUNTIFS(C2:C50,\"Pune\",E2:E50,\">=5000\")"
      },
      "grid": {
        "A1": "Order",
        "B1": "Region",
        "C1": "Rep",
        "D1": "Amount",
        "A2": "O-101",
        "B2": "North",
        "C2": "Asha",
        "D2": "42000",
        "A3": "O-102",
        "B3": "South",
        "C3": "Ravi",
        "D3": "18500",
        "A4": "O-103",
        "B4": "North",
        "C4": "Imran",
        "D4": "7600",
        "A5": "O-104",
        "B5": "East",
        "C5": "Meena",
        "D5": "26300",
        "A6": "O-105",
        "B6": "West",
        "C6": "Kavya",
        "D6": "51200",
        "A7": "O-106",
        "B7": "North",
        "C7": "Asha",
        "D7": "12900",
        "A8": "O-107",
        "B8": "South",
        "C8": "Rohit",
        "D8": "33400",
        "A9": "O-108",
        "B9": "East",
        "C9": "Sneha",
        "D9": "9800"
      },
      "starter": "",
      "solution": "=COUNTIFS(B2:B9,\"North\",D2:D9,\">10000\")",
      "explain": "North rows: 42000, 7600, 12900; two of them are above 10,000 → **2** rows. COUNTIFS uses the same AND logic as multiplying conditions in FILTER, so `=ROWS(FILTER(...))` and COUNTIFS agree."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "The manager wants the total of `=FILTER(D2:D9, (B2:B9=\"East\")+(B2:B9=\"West\"))` (East **OR** West). Write one formula that returns that total without FILTER (e.g. two SUMIFs or SUMPRODUCT).",
      "example": {
        "title": "adding two SUMIFs",
        "code": "=SUMIF(A2:A20,\"Tea\",C2:C20)+SUMIF(A2:A20,\"Coffee\",C2:C20)"
      },
      "grid": {
        "A1": "Order",
        "B1": "Region",
        "C1": "Rep",
        "D1": "Amount",
        "A2": "O-101",
        "B2": "North",
        "C2": "Asha",
        "D2": "42000",
        "A3": "O-102",
        "B3": "South",
        "C3": "Ravi",
        "D3": "18500",
        "A4": "O-103",
        "B4": "North",
        "C4": "Imran",
        "D4": "7600",
        "A5": "O-104",
        "B5": "East",
        "C5": "Meena",
        "D5": "26300",
        "A6": "O-105",
        "B6": "West",
        "C6": "Kavya",
        "D6": "51200",
        "A7": "O-106",
        "B7": "North",
        "C7": "Asha",
        "D7": "12900",
        "A8": "O-107",
        "B8": "South",
        "C8": "Rohit",
        "D8": "33400",
        "A9": "O-108",
        "B9": "East",
        "C9": "Sneha",
        "D9": "9800"
      },
      "starter": "",
      "solution": "=SUMIF(B2:B9,\"East\",D2:D9)+SUMIF(B2:B9,\"West\",D2:D9)",
      "explain": "East: 26300 + 9800, West: 51200 → **87,300**. In FILTER, **+** means OR; with SUMIF you add one SUMIF per allowed value. `=SUM(FILTER(...))` gives the same answer in Microsoft 365."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which statements about FILTER are **TRUE**? (choose all that apply)",
      "options": [
        "The include argument must have the same number of rows as the array",
        "It returns #CALC! when no rows match and if_empty is missing",
        "It can be driven by a dropdown cell, e.g. B2:B9=H1",
        "It changes the AutoFilter arrows on the source data",
        "It updates automatically when the source data changes"
      ],
      "answers": [
        0,
        1,
        2,
        4
      ],
      "explain": "FILTER is a formula: it never touches the source or its AutoFilter. A size mismatch between array and include gives **#VALUE!**, and no match without if_empty gives **#CALC!**."
    }
  ]
};
