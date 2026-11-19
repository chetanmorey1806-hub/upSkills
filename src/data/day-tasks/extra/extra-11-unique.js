// Day Task (auto-graded practice) for extra-11-unique
export default {
  "lesson": "extra-11-unique",
  "minutes": 15,
  "intro": "Build live distinct lists with UNIQUE(), count distinct values and understand its arguments.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "What does `=UNIQUE(B2:B50, FALSE, TRUE)` return?",
      "options": [
        "Every distinct value once",
        "Only the values that appear exactly once in the list",
        "Distinct columns instead of rows",
        "The duplicates only"
      ],
      "answer": 1,
      "explain": "The third argument **exactly_once = TRUE** returns only values that occur **one time** (e.g. customers who ordered only once). Leaving it FALSE (default) returns each distinct value once."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "`=UNIQUE({\"Pune\";\"Delhi\";\"Pune\";\"Agra\";\"Delhi\"})` spills a list. How many cells does it fill? (type the number)",
      "accept": [
        "3"
      ],
      "explain": "Distinct values are Pune, Delhi and Agra, in order of **first appearance**, so **3** cells. UNIQUE does not sort; wrap it in SORT for an A-Z list."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "`=UNIQUE(B2:B9)` would list each region once. Before building the report, check how many orders came from **North**, the region that appears most. Write a COUNTIF formula for North.",
      "example": {
        "title": "counting one value",
        "code": "=COUNTIF(C2:C20,\"Pune\")"
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
      "solution": "=COUNTIF(B2:B9,\"North\")",
      "explain": "North appears **3** times; UNIQUE would show it just once. COUNTIF next to a UNIQUE list (`=COUNTIF(B2:B9, F2#)`) is the classic \"distinct list with counts\" report."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Complete the formula that counts the number of **distinct customers** in A2:A500: `=______(UNIQUE(A2:A500))` (type only the function name)",
      "accept": [
        "COUNTA",
        "ROWS"
      ],
      "explain": "`=COUNTA(UNIQUE(A2:A500))` (or `ROWS`) counts the items in the spilled list. Be careful: if A2:A500 contains blanks, UNIQUE returns one extra 0 for the blanks, so use `UNIQUE(FILTER(A2:A500, A2:A500<>\"\"))`."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which statements about UNIQUE are **TRUE**? (choose all that apply)",
      "options": [
        "It is case-insensitive: \"pune\" and \"Pune\" are the same value",
        "Given two columns (A2:B9) it returns unique combinations (rows)",
        "With by_col = TRUE it compares columns instead of rows",
        "It permanently removes duplicates from the source data",
        "It updates automatically when the source changes"
      ],
      "answers": [
        0,
        1,
        2,
        4
      ],
      "explain": "UNIQUE is a formula: the source is untouched, and the list updates live. **Data > Remove Duplicates** is the command that deletes rows permanently."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "You need an **A-Z sorted** list of distinct product names for a dropdown. Which formula?",
      "options": [
        "=UNIQUE(SORT(A2:A100))",
        "=SORT(UNIQUE(A2:A100))",
        "Both work and return the same list",
        "=SORTBY(UNIQUE(A2:A100))"
      ],
      "answer": 2,
      "explain": "Both give the same sorted distinct list; **SORT(UNIQUE(...))** is the usual way because it sorts fewer values. Point Data Validation at the spill with `=$D$2#`."
    }
  ]
};
