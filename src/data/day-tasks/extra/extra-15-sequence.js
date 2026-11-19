// Day Task (auto-graded practice) for extra-15-sequence
export default {
  "lesson": "extra-15-sequence",
  "minutes": 15,
  "intro": "Generate serial numbers, number grids and date lists with SEQUENCE().",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "What does `=SEQUENCE(3,2)` spill?",
      "options": [
        "1 2 / 3 4 / 5 6 (3 rows, 2 columns, filled across first)",
        "1 4 / 2 5 / 3 6 (filled down first)",
        "3 rows of 2",
        "1 2 3 / 4 5 6"
      ],
      "answer": 0,
      "explain": "SEQUENCE(rows, columns) fills **row by row**: 1, 2 in row 1; 3, 4 in row 2; 5, 6 in row 3. To fill down columns first, wrap it in TRANSPOSE of SEQUENCE(2,3)."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "`=SEQUENCE(5, 1, 10, 5)` spills 5 numbers. What is the **last** number?",
      "accept": [
        "30"
      ],
      "explain": "Start 10, step 5: 10, 15, 20, 25, **30**. The n-th value is start + (n-1) × step = 10 + 4 × 5."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Write the formula for **serial numbers** in A2 that always match the number of names in **B2:B500** (they grow automatically when a name is added).",
      "accept": [
        "=SEQUENCE(COUNTA(B2:B500))",
        "SEQUENCE(COUNTA(B2:B500))"
      ],
      "acceptRegex": [
        "^=?\\s*SEQUENCE\\(\\s*(COUNTA|ROWS)\\(\\s*\\$?B\\$?2:\\$?B\\$?500\\s*\\)\\s*\\)$"
      ],
      "explain": "`=SEQUENCE(COUNTA(B2:B500))` creates 1, 2, 3 ... for as many names as exist. Typed or dragged serial numbers break when rows are added or deleted."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Invoice numbers are generated with `=SEQUENCE(50, 1, B1, B2)` (start in B1, step in B2). Write a formula that returns the **12th** invoice number using B1 and B2.",
      "example": {
        "title": "n-th term of a sequence",
        "text": "For =SEQUENCE(10,1,100,10) the 4th value is:",
        "code": "=100+(4-1)*10"
      },
      "grid": {
        "A1": "Start",
        "B1": "1001",
        "A2": "Step",
        "B2": "1",
        "A4": "Count",
        "B4": "50"
      },
      "starter": "",
      "solution": "=B1+(12-1)*B2",
      "explain": "The n-th value is **start + (n-1) × step** = 1001 + 11 × 1 = **1012**. A common slip is start + n × step, which is one step too far."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Which formula lists the **first day of every month** from April 2025 (12 dates)?",
      "options": [
        "=SEQUENCE(12,1,DATE(2025,4,1),30)",
        "=DATE(2025,SEQUENCE(12,1,4),1)",
        "=SEQUENCE(DATE(2025,4,1),12)",
        "=EDATE(2025,4,12)"
      ],
      "answer": 1,
      "explain": "`DATE(2025, SEQUENCE(12,1,4), 1)` builds months 4, 5, ... 15; DATE rolls month 13 into January 2026 automatically. Adding 30 days drifts because months have 28-31 days."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "`=SEQUENCE(COUNTA(B2:B500))` is in A2. Which reference counts how many serial numbers it currently shows?",
      "options": [
        "=COUNT(A2)",
        "=COUNT(A2#)",
        "=COUNT(A:A2)",
        "=COUNT(#A2)"
      ],
      "answer": 1,
      "explain": "The **spill reference** `A2#` refers to the whole spilled result, whatever its size. `A2` alone is only the first cell."
    }
  ]
};
