export default {
  "id": "extra-19-subtotal",
  "title": "SUBTOTAL()",
  "module": "Additional Job-Oriented Skills",
  "extraNo": 19,
  "level": "Intermediate",
  "duration": "1 hour",
  "summary": "SUBTOTAL() calculates sum, count, average, max, min and more on ONLY the visible rows of a list. It is the right function for totals under filtered data and it ignores other SUBTOTAL results, so you never double count.",
  "objectives": [
    "Write SUBTOTAL() with the correct function_num",
    "Explain the difference between codes 1-11 and 101-111",
    "Show totals that change with AutoFilter",
    "Create serial numbers that stay continuous after filtering"
  ],
  "theory": [
    {
      "heading": "What is SUBTOTAL()?",
      "content": "When you filter a sales list to show only North, a normal `=SUM(C2:C7)` still adds ALL rows, including hidden ones. `=SUBTOTAL(9,C2:C7)` adds only the rows you can see.\n\nSUBTOTAL is also what Excel inserts automatically when you use **Data > Outline > Subtotal** (Day 53) and the Total Row of an Excel Table.",
      "syntax": "=SUBTOTAL(function_num, ref1, [ref2], ...)"
    },
    {
      "heading": "Arguments explained",
      "content": "- `function_num` (required): a number that tells which calculation to do (see table below).\n- `ref1` (required): the range to calculate, e.g. C2:C7.\n- `ref2, ...` (optional): more ranges, up to 254.\n\nKey rules:\n- Rows hidden by a **filter** are ALWAYS excluded, whichever code you use.\n- Codes **1-11** INCLUDE rows you hid manually (right-click > Hide).\n- Codes **101-111** EXCLUDE manually hidden rows too.\n- Other SUBTOTAL (and AGGREGATE) formulas inside the range are ignored, preventing double counting.\n- Works vertically: hidden COLUMNS are not ignored."
    },
    {
      "heading": "Function number table",
      "content": "Each calculation has two codes: the first INCLUDES manually hidden rows, the second IGNORES them.\n\n- 1 / 101 = AVERAGE\n- 2 / 102 = COUNT (numbers)\n- 3 / 103 = COUNTA (non-empty)\n- 4 / 104 = MAX\n- 5 / 105 = MIN\n- 6 / 106 = PRODUCT\n- 7 / 107 = STDEV (sample)\n- 8 / 108 = STDEVP (population)\n- 9 / 109 = SUM\n- 10 / 110 = VAR (sample)\n- 11 / 111 = VARP (population)",
      "tip": "Memory trick: 9 = SUM and 109 = SUM ignoring hidden rows. These two are used 80% of the time."
    },
    {
      "heading": "Quick ways to insert SUBTOTAL",
      "content": "- Filter a list (Ctrl+Shift+L), select the cell below the amount column and press **Alt+=** (AutoSum). Excel writes `=SUBTOTAL(9,...)` instead of SUM when a filter is active.\n- Convert data to a Table (Ctrl+T) and tick **Table Design > Table Style Options > Total Row**. The total row uses SUBTOTAL(109,...).\n- **Data > Outline > Subtotal** inserts group-wise SUBTOTAL rows."
    },
    {
      "heading": "Visible serial numbers after filtering",
      "content": "Normal serial numbers 1,2,3... look broken after filtering (e.g. 1, 3, 6). Use:\n\n`=SUBTOTAL(3,$B$2:B2)` in A2 and fill down.\n\nThe range grows row by row ($B$2 is fixed, B2 is relative) and COUNTA counts only visible names, so visible rows are always numbered 1, 2, 3...",
      "tip": "Use 103 instead of 3 if you also hide rows manually."
    }
  ],
  "examples": [
    {
      "title": "Total of filtered North sales",
      "scenario": "The sales list is filtered to show only North. Show the total of visible amounts.",
      "table": {
        "headers": [
          "A: Region",
          "B: Salesperson",
          "C: Amount (₹)"
        ],
        "rows": [
          [
            "North",
            "Amit",
            "12000"
          ],
          [
            "South",
            "Neha",
            "15000"
          ],
          [
            "North",
            "Ravi",
            "8000"
          ],
          [
            "East",
            "Pooja",
            "20000"
          ],
          [
            "South",
            "Karan",
            "10000"
          ],
          [
            "North",
            "Sneha",
            "5000"
          ]
        ]
      },
      "steps": [
        "Select A1:C7 and press Ctrl+Shift+L to add filter buttons",
        "In C9 type =SUM(C2:C7) and in C10 type =SUBTOTAL(9,C2:C7)",
        "Open the Region filter, untick Select All, tick North, click OK"
      ],
      "code": "=SUBTOTAL(9,C2:C7)",
      "result": "Before filter: both show 70000. After filter North: SUM still 70000, SUBTOTAL = 25000",
      "explanation": "Visible North rows: 12000 + 8000 + 5000 = 25000. SUM ignores the filter; SUBTOTAL does not count filtered-out rows."
    },
    {
      "title": "Count and average of visible rows",
      "scenario": "Filter Region = South and show the number of salespersons and their average sale.",
      "table": {
        "headers": [
          "A: Region",
          "B: Salesperson",
          "C: Amount (₹)"
        ],
        "rows": [
          [
            "North",
            "Amit",
            "12000"
          ],
          [
            "South",
            "Neha",
            "15000"
          ],
          [
            "North",
            "Ravi",
            "8000"
          ],
          [
            "East",
            "Pooja",
            "20000"
          ],
          [
            "South",
            "Karan",
            "10000"
          ],
          [
            "North",
            "Sneha",
            "5000"
          ]
        ]
      },
      "steps": [
        "Apply filter Region = South",
        "In C11 type =SUBTOTAL(3,B2:B7)",
        "In C12 type =SUBTOTAL(1,C2:C7)",
        "Press Enter for each"
      ],
      "code": "=SUBTOTAL(3,B2:B7)\n=SUBTOTAL(1,C2:C7)",
      "result": "Count = 2, Average = 12500",
      "explanation": "Visible South rows: Neha 15000 and Karan 10000. (15000 + 10000) / 2 = 12500. Code 3 = COUNTA, code 1 = AVERAGE."
    },
    {
      "title": "Code 9 vs 109 with manually hidden rows",
      "scenario": "No filter is applied. You manually hide rows 3 and 4 (Neha and Ravi) by selecting them and pressing Ctrl+9 (or right-click > Hide).",
      "table": {
        "headers": [
          "A: Region",
          "B: Salesperson",
          "C: Amount (₹)"
        ],
        "rows": [
          [
            "North",
            "Amit",
            "12000"
          ],
          [
            "South",
            "Neha",
            "15000"
          ],
          [
            "North",
            "Ravi",
            "8000"
          ],
          [
            "East",
            "Pooja",
            "20000"
          ],
          [
            "South",
            "Karan",
            "10000"
          ],
          [
            "North",
            "Sneha",
            "5000"
          ]
        ]
      },
      "steps": [
        "Select rows 3:4 and press Ctrl+9",
        "In E2 type =SUBTOTAL(9,C2:C7)",
        "In E3 type =SUBTOTAL(109,C2:C7)"
      ],
      "code": "=SUBTOTAL(9,C2:C7)\n=SUBTOTAL(109,C2:C7)",
      "result": "E2 = 70000, E3 = 47000",
      "explanation": "Code 9 includes manually hidden rows (70000). Code 109 excludes them: 70000 - 15000 - 8000 = 47000. To unhide, select rows 2:5 and press Ctrl+Shift+9."
    },
    {
      "title": "Serial numbers that stay continuous after filter",
      "scenario": "Add a S.No. column that shows 1, 2, 3 for visible rows only.",
      "table": {
        "headers": [
          "A: S.No.",
          "B: Region",
          "C: Salesperson",
          "D: Amount (₹)"
        ],
        "rows": [
          [
            "(formula)",
            "North",
            "Amit",
            "12000"
          ],
          [
            "(formula)",
            "South",
            "Neha",
            "15000"
          ],
          [
            "(formula)",
            "North",
            "Ravi",
            "8000"
          ],
          [
            "(formula)",
            "East",
            "Pooja",
            "20000"
          ],
          [
            "(formula)",
            "South",
            "Karan",
            "10000"
          ],
          [
            "(formula)",
            "North",
            "Sneha",
            "5000"
          ]
        ]
      },
      "steps": [
        "Click A2",
        "Type =SUBTOTAL(3,$C$2:C2)",
        "Press Enter and fill down to A7",
        "Filter Region = North"
      ],
      "code": "=SUBTOTAL(3,$C$2:C2)",
      "result": "Unfiltered: 1 to 6. After filtering North: Amit 1, Ravi 2, Sneha 3",
      "explanation": "The expanding range $C$2:C2, $C$2:C3, ... counts only visible names above and including the current row."
    },
    {
      "title": "Grand total that ignores section subtotals",
      "scenario": "A report has subtotals per region inside the same column. The grand total must not double count.",
      "table": {
        "headers": [
          "A: Region",
          "B: Amount (₹)"
        ],
        "rows": [
          [
            "North",
            "12000"
          ],
          [
            "North",
            "8000"
          ],
          [
            "North Total",
            "=SUBTOTAL(9,B2:B3) -> 20000"
          ],
          [
            "South",
            "15000"
          ],
          [
            "South",
            "10000"
          ],
          [
            "South Total",
            "=SUBTOTAL(9,B5:B6) -> 25000"
          ]
        ]
      },
      "steps": [
        "Click B8",
        "Type =SUBTOTAL(9,B2:B7)",
        "Press Enter"
      ],
      "code": "=SUBTOTAL(9,B2:B7)",
      "result": "45000",
      "explanation": "SUBTOTAL skips the cells B4 and B7 because they contain SUBTOTAL formulas. A plain SUM(B2:B7) would return 90000 (double counted)."
    }
  ],
  "interview": [
    {
      "q": "What is the difference between SUM and SUBTOTAL(9,...)?",
      "a": "SUM adds every cell in the range including filtered-out rows. SUBTOTAL(9,...) excludes rows hidden by a filter and ignores other SUBTOTAL formulas in the range.",
      "level": "Easy"
    },
    {
      "q": "What is the difference between SUBTOTAL(9) and SUBTOTAL(109)?",
      "a": "Both ignore filtered rows. 9 includes rows hidden manually; 109 excludes manually hidden rows as well.",
      "level": "Medium"
    },
    {
      "q": "Which function_num gives COUNTA and which gives MAX?",
      "a": "3 (or 103) is COUNTA; 4 (or 104) is MAX.",
      "level": "Easy"
    },
    {
      "q": "Why does a grand total built with SUBTOTAL not double count section subtotals?",
      "a": "SUBTOTAL ignores any cells in its range that themselves contain SUBTOTAL or AGGREGATE formulas.",
      "level": "Medium"
    },
    {
      "q": "Does SUBTOTAL ignore hidden columns?",
      "a": "No. It only works on hidden rows in vertical ranges. Hidden columns are always included.",
      "level": "Hard"
    },
    {
      "q": "How do you keep serial numbers continuous after filtering?",
      "a": "Use =SUBTOTAL(3,$B$2:B2) (or 103) and fill down. It counts only visible non-empty cells up to the current row.",
      "level": "Medium"
    },
    {
      "q": "What happens when you press Alt+= under a filtered column?",
      "a": "Excel inserts =SUBTOTAL(9,range) instead of SUM, so the total reflects only visible rows.",
      "level": "Medium"
    },
    {
      "q": "Can SUBTOTAL ignore error values?",
      "a": "No. If the range contains an error, SUBTOTAL returns an error. Use AGGREGATE with option 6 or 7 to ignore errors.",
      "level": "Hard"
    }
  ],
  "practice": [
    {
      "task": "Using the sales list (North 12000, South 15000, North 8000, East 20000, South 10000, North 5000), filter Region = North and find the highest visible sale.",
      "hint": "Code 4 is MAX.",
      "solution": "=SUBTOTAL(4,C2:C7) returns 12000."
    },
    {
      "task": "With the same list filtered to South, find the lowest visible sale and the number of numeric values.",
      "hint": "Codes 5 and 2.",
      "solution": "=SUBTOTAL(5,C2:C7) returns 10000; =SUBTOTAL(2,C2:C7) returns 2."
    },
    {
      "task": "Without a filter, hide row 5 (Pooja, East 20000) manually. Write formulas showing total including and excluding this hidden row.",
      "hint": "9 vs 109.",
      "solution": "=SUBTOTAL(9,C2:C7) returns 70000; =SUBTOTAL(109,C2:C7) returns 50000."
    },
    {
      "task": "Convert the list to an Excel Table and add a total row showing the average amount.",
      "hint": "Ctrl+T, Table Design > Total Row.",
      "solution": "Select A1:C7, press Ctrl+T, OK. Tick Table Design > Table Style Options > Total Row. In the total row under Amount choose Average from the drop-down. Excel writes =SUBTOTAL(101,[Amount (₹)]) which returns 11666.67 (70000/6)."
    }
  ],
  "quiz": [
    {
      "question": "Which function_num calculates SUM?",
      "options": [
        "1",
        "3",
        "9",
        "11"
      ],
      "answer": 2,
      "explanation": "9 = SUM, 109 = SUM ignoring manually hidden rows."
    },
    {
      "question": "Rows hidden by a filter are:",
      "options": [
        "Included by code 9",
        "Excluded by all codes",
        "Excluded only by 101-111",
        "Included by all codes"
      ],
      "answer": 1,
      "explanation": "Filtered rows are always excluded."
    },
    {
      "question": "=SUBTOTAL(103,B2:B20) does what?",
      "options": [
        "Sums visible values",
        "Counts visible non-empty cells",
        "Averages",
        "Counts all cells"
      ],
      "answer": 1,
      "explanation": "103 = COUNTA ignoring hidden rows."
    },
    {
      "question": "SUBTOTAL inside the range of another SUBTOTAL is:",
      "options": [
        "Added twice",
        "Ignored",
        "Causes #REF!",
        "Multiplied"
      ],
      "answer": 1,
      "explanation": "This prevents double counting."
    },
    {
      "question": "Which shortcut inserts SUBTOTAL automatically under a filtered column?",
      "options": [
        "Ctrl+T",
        "Alt+=",
        "Ctrl+Shift+L",
        "F4"
      ],
      "answer": 1,
      "explanation": "AutoSum (Alt+=) uses SUBTOTAL when a filter is active."
    }
  ]
};
