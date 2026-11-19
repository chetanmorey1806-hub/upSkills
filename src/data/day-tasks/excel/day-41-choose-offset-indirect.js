// Day Task (auto-graded practice) for day-41-choose-offset-indirect
export default {
  "lesson": "day-41-choose-offset-indirect",
  "minutes": 25,
  "intro": "Pick values by position with CHOOSE(), and understand dynamic references with OFFSET() and INDIRECT().",
  "tasks": [
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "A2 has a month number (3). Use **CHOOSE** to return the quarter name for months 1-4 as \"Q1\",\"Q1\",\"Q1\",\"Q2\".",
      "example": {
        "title": "CHOOSE",
        "code": "=CHOOSE(B2, \"Low\", \"Medium\", \"High\")"
      },
      "grid": {
        "A1": "Month No",
        "B1": "Region Code",
        "C1": "Jan",
        "D1": "Feb",
        "E1": "Mar",
        "F1": "Apr",
        "A2": "3",
        "B2": "2",
        "C2": "42000",
        "D2": "45500",
        "E2": "39800",
        "F2": "51200"
      },
      "starter": "",
      "solution": "=CHOOSE(A2,\"Q1\",\"Q1\",\"Q1\",\"Q2\")",
      "explain": "CHOOSE(index_num, value1, value2, ...) returns the value at that position: index 3 → **Q1**."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "B2 has a region code (2). Return the region name: 1 = \"North\", 2 = \"South\", 3 = \"East\", 4 = \"West\".",
      "example": {
        "title": "CHOOSE with text",
        "code": "=CHOOSE(A5, \"Mon\", \"Tue\", \"Wed\")"
      },
      "grid": {
        "A1": "Month No",
        "B1": "Region Code",
        "C1": "Jan",
        "D1": "Feb",
        "E1": "Mar",
        "F1": "Apr",
        "A2": "3",
        "B2": "2",
        "C2": "42000",
        "D2": "45500",
        "E2": "39800",
        "F2": "51200"
      },
      "starter": "",
      "solution": "=CHOOSE(B2,\"North\",\"South\",\"East\",\"West\")",
      "explain": "Index 2 → **South**. If B2 were 5 (no 5th value), CHOOSE would return #VALUE!."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Use CHOOSE to return the sales for the month number in **A2** from C2:F2 (each month as a separate value argument).",
      "example": {
        "title": "CHOOSE returning cells",
        "code": "=CHOOSE(H1, B2, C2, D2)"
      },
      "grid": {
        "A1": "Month No",
        "B1": "Region Code",
        "C1": "Jan",
        "D1": "Feb",
        "E1": "Mar",
        "F1": "Apr",
        "A2": "3",
        "B2": "2",
        "C2": "42000",
        "D2": "45500",
        "E2": "39800",
        "F2": "51200"
      },
      "starter": "",
      "solution": "=CHOOSE(A2,C2,D2,E2,F2)",
      "explain": "CHOOSE can return cell values too: month 3 → E2 → **39800**. (INDEX(C2:F2, A2) gives the same.)"
    },
    {
      "type": "output",
      "mins": 2,
      "q": "What does this formula return? (OFFSET moves from C2 by 0 rows and 1 column, then takes 1 row x 3 columns)",
      "code": "  | A        | B           | C     | D     | E     | F\n1 | Month No | Region Code | Jan   | Feb   | Mar   | Apr\n2 | 3        | 2           | 42000 | 45500 | 39800 | 51200\n\n=SUM(OFFSET(C2,0,1,1,3))",
      "expected": "136500",
      "explain": "OFFSET(C2, 0, 1, 1, 3) starts at D2 and covers D2:F2. SUM = 45500 + 39800 + 51200 = **136500**. Changing the arguments moves the range, which is how \"last 3 months\" totals are built."
    },
    {
      "type": "output",
      "mins": 2,
      "q": "A1 contains the text **C2**. What does `=INDIRECT(A1)` return (C2 has 42000)?",
      "code": "=INDIRECT(A1)",
      "expected": "42000",
      "explain": "INDIRECT turns the text \"C2\" into a real reference to cell C2, so the result is **42000**. Typing a sheet or cell name in a cell and using INDIRECT makes reports switch source easily."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which of these functions are **volatile** (recalculate on every change in the workbook)? (choose all that apply)",
      "options": [
        "OFFSET",
        "INDIRECT",
        "CHOOSE",
        "SUM",
        "TODAY"
      ],
      "answers": [
        0,
        1,
        4
      ],
      "explain": "**OFFSET, INDIRECT, TODAY, NOW, RAND** are volatile and recalculate every time anything changes, which can slow big workbooks. CHOOSE and SUM recalculate only when their inputs change."
    }
  ]
};
