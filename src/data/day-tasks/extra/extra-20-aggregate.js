// Day Task (auto-graded practice) for extra-20-aggregate
export default {
  "lesson": "extra-20-aggregate",
  "minutes": 20,
  "intro": "Use AGGREGATE() to sum, find k-th values and apply conditions while ignoring errors and hidden rows.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "What does `=AGGREGATE(9, 6, C2:C8)` calculate?",
      "options": [
        "The 9th value, ignoring hidden rows",
        "The SUM of C2:C8, ignoring error values",
        "The AVERAGE, ignoring blanks",
        "The SUM, including errors"
      ],
      "answer": 1,
      "explain": "function_num **9 = SUM** and options **6 = ignore error values**. A plain `=SUM(C2:C8)` would return #DIV/0! if any cell has an error."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Which **options** number makes AGGREGATE ignore **both hidden rows and error values**?",
      "accept": [
        "7"
      ],
      "explain": "Options: 0/1 ignore nested SUBTOTAL/AGGREGATE (+ hidden rows for 1), 2/3 + errors, 4 ignore nothing, **5 hidden rows**, **6 error values**, **7 hidden rows and error values**."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Some branches show **#DIV/0!** in Margin %. `=AGGREGATE(9, 6, C2:C8)` adds the margins and skips the errors. Write a formula that returns the same total without AGGREGATE (e.g. SUMIF with a \">0\"-style condition, which skips errors).",
      "example": {
        "title": "adding only the numbers",
        "code": "=SUMIF(D2:D40,\">=0\")"
      },
      "grid": {
        "A1": "Branch",
        "B1": "Region",
        "C1": "Margin %",
        "A2": "Pune",
        "B2": "West",
        "C2": "18",
        "A3": "Nagpur",
        "B3": "Central",
        "C3": "=1/0",
        "A4": "Nashik",
        "B4": "West",
        "C4": "22",
        "A5": "Bhopal",
        "B5": "Central",
        "C5": "15",
        "A6": "Surat",
        "B6": "West",
        "C6": "26",
        "A7": "Indore",
        "B7": "Central",
        "C7": "=1/0",
        "A8": "Thane",
        "B8": "West",
        "C8": "20"
      },
      "starter": "",
      "solution": "=SUMIF(C2:C8,\">0\")",
      "explain": "The valid margins are 18 + 22 + 15 + 26 + 20 = **101**. SUMIF only adds cells that meet the condition, so the error cells are skipped. `=SUM(C2:C8)` would return #DIV/0!."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Which function numbers of AGGREGATE are **LARGE** and **SMALL** (used with the array form and k)?",
      "options": [
        "4 and 5",
        "14 and 15",
        "12 and 13",
        "16 and 17"
      ],
      "answer": 1,
      "explain": "**14 = LARGE**, **15 = SMALL**, 16 PERCENTILE.INC, 17 QUARTILE.INC, 18 PERCENTILE.EXC, 19 QUARTILE.EXC. 4 and 5 are MAX and MIN."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "`=AGGREGATE(14, 6, C2:C8/(B2:B8=\"West\"), 1)` finds the **highest West margin** (dividing by FALSE creates errors that option 6 ignores). Write a formula that returns the same value without AGGREGATE.",
      "example": {
        "title": "maximum with a condition",
        "code": "=MAXIFS(E2:E50,C2:C50,\"Mumbai\")"
      },
      "grid": {
        "A1": "Branch",
        "B1": "Region",
        "C1": "Margin %",
        "A2": "Pune",
        "B2": "West",
        "C2": "18",
        "A3": "Nagpur",
        "B3": "Central",
        "C3": "31",
        "A4": "Nashik",
        "B4": "West",
        "C4": "22",
        "A5": "Bhopal",
        "B5": "Central",
        "C5": "15",
        "A6": "Surat",
        "B6": "West",
        "C6": "26",
        "A7": "Indore",
        "B7": "Central",
        "C7": "29",
        "A8": "Thane",
        "B8": "West",
        "C8": "20"
      },
      "starter": "",
      "solution": "=MAXIFS(C2:C8,B2:B8,\"West\")",
      "explain": "West margins are 18, 22, 26, 20 → **26**. The AGGREGATE trick works in every Excel version since 2010; MAXIFS (Excel 2019+) is the simpler modern way. Note Nagpur (31) is Central, so `=MAX(C2:C8)` is wrong."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which statements comparing **AGGREGATE** and **SUBTOTAL** are TRUE? (choose all that apply)",
      "options": [
        "AGGREGATE has 19 functions, SUBTOTAL has 11",
        "AGGREGATE can ignore error values, SUBTOTAL cannot",
        "Both can ignore rows hidden by a filter",
        "Only SUBTOTAL works with filtered lists",
        "AGGREGATE ignores hidden rows in vertical ranges, not hidden columns"
      ],
      "answers": [
        0,
        1,
        2,
        4
      ],
      "explain": "AGGREGATE is a \"super SUBTOTAL\": more functions (incl. LARGE, SMALL, MEDIAN, PERCENTILE) and error handling. Like SUBTOTAL, it ignores hidden **rows** but not hidden columns."
    }
  ]
};
