// Day Task (auto-graded practice) for extra-14-sortby
export default {
  "lesson": "extra-14-sortby",
  "minutes": 15,
  "intro": "Sort one range by another range, by several levels and by a custom order with SORTBY().",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "What can **SORTBY** do that SORT cannot?",
      "options": [
        "Sort descending",
        "Sort by a range that is not part of the returned result",
        "Spill the result",
        "Sort text"
      ],
      "answer": 1,
      "explain": "SORTBY takes **by_array** ranges, so you can return only names but sort them by a score column you do not show: `=SORTBY(A2:A9, D2:D9, -1)`."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Write a formula that returns the **Rep names (C2:C9)** sorted by **Amount (D2:D9)** from highest to lowest.",
      "accept": [
        "=SORTBY(C2:C9,D2:D9,-1)",
        "SORTBY(C2:C9,D2:D9,-1)"
      ],
      "acceptRegex": [
        "^=?\\s*SORTBY\\(\\s*\\$?C\\$?2:\\$?C\\$?9\\s*,\\s*\\$?D\\$?2:\\$?D\\$?9\\s*,\\s*-1\\s*\\)$"
      ],
      "explain": "`=SORTBY(C2:C9, D2:D9, -1)`: the array to return, the range to sort by, and the order. by_array must have the same number of rows as the array, otherwise you get #VALUE!."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Using `=SORTBY(C2:C9, D2:D9, -1)`, which rep will be at the **top**? Write a formula that returns that name (hint: the rep with the maximum amount).",
      "example": {
        "title": "return the name next to a value",
        "code": "=XLOOKUP(MIN(E2:E20),E2:E20,B2:B20)"
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
      "solution": "=INDEX(C2:C9,MATCH(MAX(D2:D9),D2:D9,0))",
      "explain": "The highest amount is 51,200, which belongs to **Kavya**, so she is first. `INDEX/MATCH` (or `XLOOKUP(MAX(D2:D9), D2:D9, C2:C9)`) finds the row of the maximum."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Tasks must be sorted in the custom order **High, Medium, Low** (not alphabetically). Which formula does it?",
      "options": [
        "=SORT(A2:C9, 2)",
        "=SORTBY(A2:C9, MATCH(B2:B9, {\"High\",\"Medium\",\"Low\"}, 0))",
        "=SORTBY(A2:C9, B2:B9, {\"High\",\"Medium\",\"Low\"})",
        "=SORT(A2:C9, {\"High\",\"Medium\",\"Low\"})"
      ],
      "answer": 1,
      "explain": "`MATCH(B2:B9, {\"High\",\"Medium\",\"Low\"}, 0)` turns each priority into 1, 2 or 3, and SORTBY sorts by those numbers. Sorting the text directly would give High, Low, Medium (alphabetical)."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "For the custom-order sort above, what sort key does MATCH give the task in row **3**? Write `MATCH(B3, {\"High\",\"Medium\",\"Low\"}, 0)`-style formula for row 3.",
      "example": {
        "title": "MATCH against an array constant",
        "code": "=MATCH(\"Silver\",{\"Gold\",\"Silver\",\"Bronze\"},0)   → 2"
      },
      "grid": {
        "A1": "Task",
        "B1": "Priority",
        "C1": "Owner",
        "A2": "Send GST file",
        "B2": "High",
        "C2": "Asha",
        "A3": "Update price list",
        "B3": "Low",
        "C3": "Ravi",
        "A4": "Call vendor",
        "B4": "Medium",
        "C4": "Imran",
        "A5": "Bank reconciliation",
        "B5": "High",
        "C5": "Meena"
      },
      "starter": "",
      "solution": "=MATCH(B3,{\"High\",\"Medium\",\"Low\"},0)",
      "explain": "B3 is \"Low\", which is the 3rd item of the list → key **3**, so this task goes to the bottom. Exact match (0) is required; approximate match would give wrong positions on unsorted lists."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "`=SORTBY(A2:A10, C2:C12, -1)` returns which result?",
      "options": [
        "A sorted list",
        "#VALUE! because the ranges have different sizes",
        "#SPILL!",
        "#N/A"
      ],
      "answer": 1,
      "explain": "A2:A10 has 9 rows but C2:C12 has 11, so SORTBY returns **#VALUE!**. Each by_array must be exactly the same height (or width) as the array."
    }
  ]
};
