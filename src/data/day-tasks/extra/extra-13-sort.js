// Day Task (auto-graded practice) for extra-13-sort
export default {
  "lesson": "extra-13-sort",
  "minutes": 15,
  "intro": "Create live sorted lists and leaderboards with SORT(), including multi-level sorts.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "What does `=SORT(A2:C20, 3, -1)` do?",
      "options": [
        "Sorts by column C (the 3rd column of the range), largest first",
        "Sorts by column C, smallest first",
        "Returns only 3 rows",
        "Sorts by the 3rd row"
      ],
      "answer": 0,
      "explain": "**sort_index = 3** is the 3rd column **of the array** (not of the sheet) and **sort_order = -1** means descending. 1 (or omitted) is ascending."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "`=SORT({40;15;25})` spills three values. What is the **first** (top) value?",
      "accept": [
        "15"
      ],
      "explain": "With no other arguments SORT uses the first column, ascending: 15, 25, 40. The top value is **15**."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Write a formula that sorts the table **A2:D9** by **Amount** (column D, the 4th column) from **highest to lowest**.",
      "accept": [
        "=SORT(A2:D9,4,-1)",
        "SORT(A2:D9,4,-1)",
        "=SORT(A2:D9,4,-1,FALSE)"
      ],
      "acceptRegex": [
        "^=?\\s*SORT\\(\\s*\\$?A\\$?2:\\$?D\\$?9\\s*,\\s*4\\s*,\\s*-1\\s*(,\\s*(FALSE|0)\\s*)?\\)$"
      ],
      "explain": "`=SORT(A2:D9, 4, -1)`: array, sort_index 4 (Amount), sort_order -1 (descending). A common mistake is writing `\"D\"` or `D2:D9` as sort_index; it must be a column **number**."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "A leaderboard uses `=SORT(A2:D9, 4, -1)`. Which **amount** will be in the **2nd** row of the result? Write a formula that returns it without SORT.",
      "example": {
        "title": "k-th largest value",
        "code": "=LARGE(C2:C30,3)"
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
      "solution": "=LARGE(D2:D9,2)",
      "explain": "Sorted descending, row 2 holds the 2nd largest amount: **42,000** (51,200 is first). `LARGE(range, k)` gives the k-th value of a descending sort, `SMALL` of an ascending sort."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Which formula sorts A2:D9 by **Region (column 2) A-Z** and then by **Amount (column 4) highest first** within each region?",
      "options": [
        "=SORT(A2:D9, 2, 1, 4, -1)",
        "=SORT(A2:D9, {2,4}, {1,-1})",
        "=SORT(SORT(A2:D9,4,1),2,-1)",
        "=SORT(A2:D9, \"2,4\", \"1,-1\")"
      ],
      "answer": 1,
      "explain": "Multi-level sort uses **array constants**: `{2,4}` for the columns and `{1,-1}` for the orders, matched in pairs. SORT has only 4 arguments, so option A is invalid."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which statements about SORT are **TRUE**? (choose all that apply)",
      "options": [
        "The source data stays in its original order",
        "The result updates automatically when values change",
        "by_col = TRUE sorts columns left-to-right instead of rows",
        "It can sort by a column that is not inside the array",
        "Numbers sort before text and blanks go last in ascending order"
      ],
      "answers": [
        0,
        1,
        2,
        4
      ],
      "explain": "SORT can sort only by columns **inside** the array; to sort by another range (e.g. a hidden score column) use **SORTBY**."
    }
  ]
};
