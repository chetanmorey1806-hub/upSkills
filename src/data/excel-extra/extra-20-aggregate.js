export default {
  "id": "extra-20-aggregate",
  "title": "AGGREGATE()",
  "module": "Additional Job-Oriented Skills",
  "extraNo": 20,
  "level": "Advanced",
  "duration": "1.5 hours",
  "summary": "AGGREGATE() is a more powerful SUBTOTAL. It offers 19 calculations (including LARGE, SMALL, MEDIAN and PERCENTILE) and can ignore hidden rows, error values and nested subtotals, so a single #N/A no longer breaks your report total.",
  "objectives": [
    "Write AGGREGATE() in reference form and array form",
    "Choose the right function_num (1-19) and options (0-7)",
    "Total, max and min a range that contains errors",
    "Use AGGREGATE(14/15,6,...) for conditional max/min and nth match lookups"
  ],
  "theory": [
    {
      "heading": "What is AGGREGATE()?",
      "content": "In real office files, a column often contains errors like #N/A (from VLOOKUP) or #DIV/0!. `=SUM()` on such a column returns the error. `=AGGREGATE(9,6,range)` sums the column while **ignoring the errors**.\n\nAGGREGATE has two forms:",
      "syntax": "Reference form: =AGGREGATE(function_num, options, ref1, [ref2], ...)\nArray form:     =AGGREGATE(function_num, options, array, [k])",
      "points": [
        "Reference form is used with functions 1-13",
        "Array form is used with functions 14-19, which need k (e.g. 2nd largest)"
      ]
    },
    {
      "heading": "Arguments explained",
      "content": "- `function_num` (required): which calculation, 1 to 19.\n- `options` (required): what to ignore, 0 to 7.\n- `ref1` / `array` (required): the range or array to calculate.\n- `ref2...` (optional, reference form): more ranges.\n- `k` (array form): position for LARGE/SMALL (k-th value) or the percentile/quartile value for 16-19."
    },
    {
      "heading": "function_num list (1-19)",
      "content": "- 1 AVERAGE\n- 2 COUNT\n- 3 COUNTA\n- 4 MAX\n- 5 MIN\n- 6 PRODUCT\n- 7 STDEV.S\n- 8 STDEV.P\n- 9 SUM\n- 10 VAR.S\n- 11 VAR.P\n- 12 MEDIAN\n- 13 MODE.SNGL\n- 14 LARGE (needs k)\n- 15 SMALL (needs k)\n- 16 PERCENTILE.INC (needs k)\n- 17 QUARTILE.INC (needs k)\n- 18 PERCENTILE.EXC (needs k)\n- 19 QUARTILE.EXC (needs k)"
    },
    {
      "heading": "options list (0-7)",
      "content": "- 0 (or omitted): ignore nested SUBTOTAL and AGGREGATE functions\n- 1: ignore hidden rows + nested SUBTOTAL/AGGREGATE\n- 2: ignore error values + nested SUBTOTAL/AGGREGATE\n- 3: ignore hidden rows + error values + nested SUBTOTAL/AGGREGATE\n- 4: ignore nothing\n- 5: ignore hidden rows only\n- 6: ignore error values only\n- 7: ignore hidden rows and error values\n\nMost used: **6** (ignore errors) and **7** (ignore errors and hidden/filtered rows).",
      "tip": "Like SUBTOTAL, AGGREGATE works on hidden ROWS, not hidden columns."
    },
    {
      "heading": "Array form trick: conditions without helper columns",
      "content": "Functions 14-19 accept a calculated array. Dividing by a condition turns FALSE rows into #DIV/0! errors, and option 6 ignores them:\n\n`=AGGREGATE(14,6,C2:C7/(A2:A7=\"North\"),1)` = largest North amount.\n\nThis works in ALL versions from Excel 2010 onwards and is a common interview question. In Microsoft 365 you can also use MAXIFS / MINIFS / FILTER.",
      "tip": "Functions 1-13 do NOT accept array expressions like C2:C7/(A2:A7=\"North\"); they return #VALUE!. Use 14 with k=1 instead of 4 (MAX), and 15 with k=1 instead of 5 (MIN)."
    }
  ],
  "examples": [
    {
      "title": "Sum a column that contains errors",
      "scenario": "Branch sales came from VLOOKUP and two branches show errors. Total the valid sales.",
      "table": {
        "headers": [
          "A: Branch",
          "B: Sales (₹)"
        ],
        "rows": [
          [
            "Pune",
            "5000"
          ],
          [
            "Nashik",
            "#N/A"
          ],
          [
            "Nagpur",
            "7000"
          ],
          [
            "Thane",
            "#DIV/0!"
          ],
          [
            "Mumbai",
            "3000"
          ]
        ]
      },
      "steps": [
        "Click B8 and type =SUM(B2:B6): it shows #N/A",
        "Click B9 and type =AGGREGATE(9,6,B2:B6)",
        "Press Enter"
      ],
      "code": "=AGGREGATE(9,6,B2:B6)",
      "result": "15000",
      "explanation": "Function 9 = SUM, option 6 = ignore errors. 5000 + 7000 + 3000 = 15000."
    },
    {
      "title": "MAX, MIN and AVERAGE ignoring errors",
      "scenario": "Using the same branch sales, find the highest, lowest and average valid sale.",
      "table": {
        "headers": [
          "A: Branch",
          "B: Sales (₹)"
        ],
        "rows": [
          [
            "Pune",
            "5000"
          ],
          [
            "Nashik",
            "#N/A"
          ],
          [
            "Nagpur",
            "7000"
          ],
          [
            "Thane",
            "#DIV/0!"
          ],
          [
            "Mumbai",
            "3000"
          ]
        ]
      },
      "steps": [
        "In D2 type =AGGREGATE(4,6,B2:B6)",
        "In D3 type =AGGREGATE(5,6,B2:B6)",
        "In D4 type =AGGREGATE(1,6,B2:B6)"
      ],
      "code": "=AGGREGATE(4,6,B2:B6)\n=AGGREGATE(5,6,B2:B6)\n=AGGREGATE(1,6,B2:B6)",
      "result": "MAX = 7000, MIN = 3000, AVERAGE = 5000",
      "explanation": "Only 5000, 7000 and 3000 are considered. Average = 15000 / 3 = 5000."
    },
    {
      "title": "2nd largest value ignoring errors",
      "scenario": "Find the second highest branch sale.",
      "table": {
        "headers": [
          "A: Branch",
          "B: Sales (₹)"
        ],
        "rows": [
          [
            "Pune",
            "5000"
          ],
          [
            "Nashik",
            "#N/A"
          ],
          [
            "Nagpur",
            "7000"
          ],
          [
            "Thane",
            "#DIV/0!"
          ],
          [
            "Mumbai",
            "3000"
          ]
        ]
      },
      "steps": [
        "Click D6",
        "Type =AGGREGATE(14,6,B2:B6,2)",
        "Press Enter"
      ],
      "code": "=AGGREGATE(14,6,B2:B6,2)",
      "result": "5000",
      "explanation": "14 = LARGE, k = 2. Valid values sorted high to low: 7000, 5000, 3000. LARGE(...,2) would fail on errors but AGGREGATE skips them."
    },
    {
      "title": "Largest and smallest North sale (conditional)",
      "scenario": "Without MAXIFS, find the largest and smallest amount for Region = North.",
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
        "Click E2 and type =AGGREGATE(14,6,C2:C7/(A2:A7=\"North\"),1)",
        "Click E3 and type =AGGREGATE(15,6,C2:C7/(A2:A7=\"North\"),1)",
        "Press Enter for each"
      ],
      "code": "=AGGREGATE(14,6,C2:C7/(A2:A7=\"North\"),1)\n=AGGREGATE(15,6,C2:C7/(A2:A7=\"North\"),1)",
      "result": "Largest North = 12000, Smallest North = 5000",
      "explanation": "(A2:A7=\"North\") is {TRUE,FALSE,TRUE,FALSE,FALSE,TRUE}. Dividing gives {12000,#DIV/0!,8000,#DIV/0!,#DIV/0!,5000}. Option 6 ignores the errors."
    },
    {
      "title": "Return the 2nd North salesperson (nth match lookup)",
      "scenario": "VLOOKUP returns only the first match. Find the name of the 2nd salesperson in North.",
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
        "Click E5",
        "Type =INDEX(B2:B7, AGGREGATE(15,6,(ROW(A2:A7)-ROW(A2)+1)/(A2:A7=\"North\"),2))",
        "Press Enter"
      ],
      "code": "=INDEX(B2:B7, AGGREGATE(15,6,(ROW(A2:A7)-ROW(A2)+1)/(A2:A7=\"North\"),2))",
      "result": "Ravi",
      "explanation": "ROW(A2:A7)-ROW(A2)+1 gives positions 1 to 6. North rows are at positions 1, 3 and 6. SMALL with k=2 returns 3, and INDEX(B2:B7,3) = Ravi."
    },
    {
      "title": "Total that ignores errors AND filtered rows",
      "scenario": "The branch list is filtered to hide Mumbai, and errors still exist. Show the total of visible valid sales.",
      "table": {
        "headers": [
          "A: Branch",
          "B: Sales (₹)"
        ],
        "rows": [
          [
            "Pune",
            "5000"
          ],
          [
            "Nashik",
            "#N/A"
          ],
          [
            "Nagpur",
            "7000"
          ],
          [
            "Thane",
            "#DIV/0!"
          ],
          [
            "Mumbai",
            "3000"
          ]
        ]
      },
      "steps": [
        "Apply AutoFilter (Ctrl+Shift+L) and untick Mumbai in the Branch filter",
        "In B9 type =AGGREGATE(9,7,B2:B6)"
      ],
      "code": "=AGGREGATE(9,7,B2:B6)",
      "result": "12000",
      "explanation": "Option 7 ignores hidden rows and errors: visible valid values are 5000 and 7000 = 12000."
    }
  ],
  "interview": [
    {
      "q": "What is the difference between AGGREGATE and SUBTOTAL?",
      "a": "Both ignore hidden rows and nested subtotals. AGGREGATE offers 19 functions (vs 11), can also ignore error values, and has an array form for LARGE, SMALL, PERCENTILE and QUARTILE.",
      "level": "Medium"
    },
    {
      "q": "How do you sum a range that contains #N/A errors?",
      "a": "=AGGREGATE(9,6,range). 9 = SUM, 6 = ignore error values. Alternative: =SUMIF(range,\"<>#N/A\") handles only #N/A.",
      "level": "Easy"
    },
    {
      "q": "What do options 6 and 7 mean?",
      "a": "6 ignores error values only; 7 ignores hidden rows and error values.",
      "level": "Easy"
    },
    {
      "q": "Why does =AGGREGATE(4,6,C2:C7/(A2:A7=\"North\")) return #VALUE!?",
      "a": "Functions 1-13 work only with references, not calculated arrays. Use the array form with 14 (LARGE) and k = 1: =AGGREGATE(14,6,C2:C7/(A2:A7=\"North\"),1).",
      "level": "Hard"
    },
    {
      "q": "How can AGGREGATE return the nth match in a lookup?",
      "a": "Create row positions divided by the condition, take the k-th smallest with AGGREGATE(15,6,...,k), and pass it to INDEX.",
      "level": "Hard"
    },
    {
      "q": "Which function_num is MEDIAN in AGGREGATE?",
      "a": "12.",
      "level": "Easy"
    },
    {
      "q": "Does AGGREGATE ignore hidden columns?",
      "a": "No. Hidden-row options only apply to rows in vertical ranges.",
      "level": "Medium"
    },
    {
      "q": "Find the 90th percentile of a column with errors.",
      "a": "=AGGREGATE(16,6,range,0.9). 16 = PERCENTILE.INC and k = 0.9.",
      "level": "Medium"
    }
  ],
  "practice": [
    {
      "task": "B2:B7 contain 2500, #N/A, 4000, 1500, #VALUE!, 3000. Find the total, the count of valid numbers and the median.",
      "hint": "Use 9, 2 and 12 with option 6.",
      "solution": "=AGGREGATE(9,6,B2:B7) = 11000; =AGGREGATE(2,6,B2:B7) = 4; =AGGREGATE(12,6,B2:B7) = 2750 (median of 1500, 2500, 3000, 4000)."
    },
    {
      "task": "Using the same data, find the 3rd smallest valid value.",
      "hint": "15 = SMALL.",
      "solution": "=AGGREGATE(15,6,B2:B7,3) returns 3000."
    },
    {
      "task": "Using the Region/Amount list (North 12000, South 15000, North 8000, East 20000, South 10000, North 5000), find the largest South amount without MAXIFS.",
      "hint": "Divide by the condition.",
      "solution": "=AGGREGATE(14,6,C2:C7/(A2:A7=\"South\"),1) returns 15000."
    },
    {
      "task": "Return the 3rd North salesperson name from the same list.",
      "hint": "Same as the nth match example with k=3.",
      "solution": "=INDEX(B2:B7,AGGREGATE(15,6,(ROW(A2:A7)-ROW(A2)+1)/(A2:A7=\"North\"),3)) returns Sneha."
    }
  ],
  "quiz": [
    {
      "question": "=AGGREGATE(9,6,A1:A10) does what?",
      "options": [
        "Average ignoring hidden rows",
        "Sum ignoring errors",
        "Count ignoring errors",
        "Max ignoring nothing"
      ],
      "answer": 1,
      "explanation": "9 = SUM, 6 = ignore error values."
    },
    {
      "question": "Which option ignores both hidden rows and error values?",
      "options": [
        "3 only",
        "7 only",
        "Both 3 and 7",
        "5"
      ],
      "answer": 2,
      "explanation": "3 also ignores nested subtotals; 7 ignores hidden rows and errors."
    },
    {
      "question": "Function_num 14 in AGGREGATE is:",
      "options": [
        "MAX",
        "LARGE",
        "SMALL",
        "MEDIAN"
      ],
      "answer": 1,
      "explanation": "14 = LARGE, 15 = SMALL."
    },
    {
      "question": "Which function_num values need the k argument?",
      "options": [
        "1-11",
        "12-13",
        "14-19",
        "All"
      ],
      "answer": 2,
      "explanation": "LARGE, SMALL, PERCENTILE and QUARTILE need k."
    },
    {
      "question": "Values {10, #N/A, 30}: =AGGREGATE(1,6,range) returns:",
      "options": [
        "13.33",
        "20",
        "#N/A",
        "40"
      ],
      "answer": 1,
      "explanation": "Average of 10 and 30 = 20."
    }
  ]
};
