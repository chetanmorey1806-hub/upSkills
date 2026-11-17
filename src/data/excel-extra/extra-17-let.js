export default {
  "id": "extra-17-let",
  "title": "LET()",
  "module": "Additional Job-Oriented Skills",
  "extraNo": 17,
  "level": "Advanced",
  "duration": "1 hour",
  "summary": "LET() lets you give names to calculation results inside a single formula and reuse them. Long formulas become shorter, easier to read and faster, because a repeated calculation is done only once.",
  "objectives": [
    "Write LET() with one or more name/value pairs and a final calculation",
    "Follow the naming rules for LET variables",
    "Rewrite long repeated formulas (salary, GST, grading) using LET",
    "Combine LET with FILTER, IF and text functions"
  ],
  "theory": [
    {
      "heading": "What is LET()?",
      "content": "Imagine a formula that calculates `AVERAGE(B2:D2)` three times inside a nested IF. With LET you calculate it once, call it `avg`, and use `avg` everywhere.\n\nLET works like variables in programming, but the names exist **only inside that one formula**.",
      "syntax": "=LET(name1, value1, [name2, value2, ...], calculation)"
    },
    {
      "heading": "Arguments explained",
      "content": "- `name1`: the first variable name, e.g. `amt`.\n- `value1`: the value, cell, range or formula assigned to name1.\n- `name2, value2 ...` (optional): more pairs. A later value can use an earlier name.\n- `calculation` (required, ALWAYS the last argument): the final formula that uses the names. Its result is what the cell shows.\n\nSo LET always has an **odd** number of arguments: pairs + 1 final calculation. Up to 126 pairs are allowed.",
      "points": [
        "=LET(x,5,x*2) -> 10",
        "=LET(x,5,y,x+3,x*y) -> 40"
      ]
    },
    {
      "heading": "Naming rules",
      "content": "- Must start with a letter. `amt`, `gst_rate`, `TotalSales` are fine.\n- No spaces. Use `total_sales` or `TotalSales`.\n- Cannot look like a cell reference: `A1`, `GST1`, `TAX2` are invalid because they are real cell addresses.\n- Avoid names of existing functions such as `SUM`.\n- Names are not case-sensitive: `Amt` and `amt` are the same.",
      "tip": "If you break a rule, Excel shows an error message when you press Enter. Rename the variable to something like amt_total."
    },
    {
      "heading": "Why use LET? Readability and speed",
      "content": "Before:\n`=IF(AVERAGE(B2:D2)>=80,\"A\",IF(AVERAGE(B2:D2)>=60,\"B\",\"C\"))`\n\nAfter:\n`=LET(avg,AVERAGE(B2:D2),IF(avg>=80,\"A\",IF(avg>=60,\"B\",\"C\")))`\n\n- The formula reads like plain English.\n- AVERAGE is calculated once, not twice, which matters with big ranges or FILTER/XLOOKUP inside.\n- To change the range you edit it in ONE place.",
      "tip": "Press Alt+Enter inside the formula bar to put each name/value pair on its own line. It is much easier to read."
    },
    {
      "heading": "Debugging a LET formula",
      "content": "To check a middle step, temporarily change the last argument to a variable name. For example, change `amt+gst` to `gst` and press Enter to see only the GST value. Then change it back.\n\nLET is available in Microsoft 365 and Excel 2021+. Coming up next: **LAMBDA()**, which turns a LET-style formula into your own reusable function."
    }
  ],
  "examples": [
    {
      "title": "Invoice amount with 18% GST",
      "scenario": "Rate is in B2 and quantity in C2. Show the bill amount including 18% GST in D2.",
      "table": {
        "headers": [
          "A: Item",
          "B: Rate (₹)",
          "C: Qty",
          "D: Total with GST"
        ],
        "rows": [
          [
            "Office Chair",
            "1000",
            "5",
            "(formula)"
          ]
        ]
      },
      "steps": [
        "Click D2",
        "Type =LET(amt,B2*C2, gst,amt*18%, amt+gst)",
        "Press Enter"
      ],
      "code": "=LET(amt,B2*C2, gst,amt*18%, amt+gst)",
      "result": "5900",
      "explanation": "amt = 1000 x 5 = 5000; gst = 5000 x 18% = 900; final calculation amt+gst = 5900. Note gst uses the earlier name amt."
    },
    {
      "title": "Grade from average marks",
      "scenario": "Marks of a student are in B2:D2. Give grade A if average >= 80, B if >= 60, else C.",
      "table": {
        "headers": [
          "A: Student",
          "B: Maths",
          "C: Science",
          "D: English",
          "E: Grade"
        ],
        "rows": [
          [
            "Riya",
            "78",
            "85",
            "92",
            "(formula)"
          ],
          [
            "Aman",
            "65",
            "58",
            "70",
            "(formula)"
          ],
          [
            "Karan",
            "40",
            "55",
            "52",
            "(formula)"
          ]
        ]
      },
      "steps": [
        "Click E2",
        "Type =LET(avg,AVERAGE(B2:D2), IF(avg>=80,\"A\",IF(avg>=60,\"B\",\"C\")))",
        "Press Enter",
        "Drag the fill handle down to E4"
      ],
      "code": "=LET(avg,AVERAGE(B2:D2), IF(avg>=80,\"A\",IF(avg>=60,\"B\",\"C\")))",
      "result": "E2 = A (avg 85), E3 = B (avg 64.33), E4 = C (avg 49)",
      "explanation": "Riya: (78+85+92)/3 = 85. Aman: (65+58+70)/3 = 193/3 = 64.33. Karan: (40+55+52)/3 = 147/3 = 49. AVERAGE is computed once per row."
    },
    {
      "title": "Net salary with HRA, DA and PF",
      "scenario": "Basic salary is in B2. HRA = 40% of basic, DA = 10% of basic, PF = 12% of basic. Net = Basic + HRA + DA - PF.",
      "table": {
        "headers": [
          "A: Employee",
          "B: Basic (₹)",
          "C: Net Salary"
        ],
        "rows": [
          [
            "Suresh",
            "30000",
            "(formula)"
          ],
          [
            "Meena",
            "25000",
            "(formula)"
          ]
        ]
      },
      "steps": [
        "Click C2",
        "Type =LET(basic,B2, hra,basic*40%, da,basic*10%, pf,basic*12%, basic+hra+da-pf)",
        "Press Enter",
        "Copy down to C3"
      ],
      "code": "=LET(basic,B2, hra,basic*40%, da,basic*10%, pf,basic*12%, basic+hra+da-pf)",
      "result": "C2 = 41400, C3 = 34500",
      "explanation": "Suresh: 30000 + 12000 + 3000 - 3600 = 41400. Meena: 25000 + 10000 + 2500 - 3000 = 34500. Each component has a clear name, so an auditor can read the formula easily."
    },
    {
      "title": "Salespersons above the average",
      "scenario": "List the salespersons whose sales are above the team average.",
      "table": {
        "headers": [
          "A: Salesperson",
          "B: Sales (₹)"
        ],
        "rows": [
          [
            "Amit",
            "45000"
          ],
          [
            "Neha",
            "62000"
          ],
          [
            "Ravi",
            "38000"
          ],
          [
            "Pooja",
            "71000"
          ],
          [
            "Karan",
            "50000"
          ],
          [
            "Sneha",
            "54000"
          ]
        ]
      },
      "steps": [
        "Click D2",
        "Type =LET(s,B2:B7, avg,AVERAGE(s), FILTER(A2:A7, s>avg))",
        "Press Enter: the names spill down"
      ],
      "code": "=LET(s,B2:B7, avg,AVERAGE(s), FILTER(A2:A7, s>avg))",
      "result": "Neha, Pooja, Sneha",
      "explanation": "Total = 320000, average = 53333.33. Only 62000, 71000 and 54000 are above it. LET stores the range as s and the average as avg."
    },
    {
      "title": "Clean and extract first name",
      "scenario": "Names in column A have extra spaces and wrong case, e.g. `  rahul   sharma `. Return the first name in proper case.",
      "table": {
        "headers": [
          "A: Raw Name"
        ],
        "rows": [
          [
            "  rahul   sharma "
          ],
          [
            "PRIYA desai"
          ]
        ]
      },
      "steps": [
        "Click B2",
        "Type =LET(n,TRIM(A2), first,TEXTBEFORE(n,\" \"), PROPER(first))",
        "Press Enter and copy down"
      ],
      "code": "=LET(n,TRIM(A2), first,TEXTBEFORE(n,\" \"), PROPER(first))",
      "result": "B2 = Rahul, B3 = Priya",
      "explanation": "TRIM removes extra spaces, TEXTBEFORE takes text before the first space, PROPER fixes the case. Each step is named, so it is easy to follow."
    }
  ],
  "interview": [
    {
      "q": "What is the purpose of LET()?",
      "a": "LET assigns names to intermediate calculations inside a formula. It improves readability and performance because a repeated expression is calculated only once.",
      "level": "Easy"
    },
    {
      "q": "What is the syntax of LET and which argument is mandatory last?",
      "a": "=LET(name1, value1, [name2, value2,...], calculation). The final calculation is always the last argument and determines the result.",
      "level": "Easy"
    },
    {
      "q": "Why is the name 'GST1' not allowed in LET?",
      "a": "Because GST1 is a valid cell reference (column GST, row 1). LET names cannot look like cell references.",
      "level": "Medium"
    },
    {
      "q": "Can a LET variable use another variable?",
      "a": "Yes, as long as it is defined earlier: =LET(a,10,b,a*2,a+b) returns 30.",
      "level": "Easy"
    },
    {
      "q": "How does LET improve performance?",
      "a": "Without LET, a formula like IF(XLOOKUP(...)>0, XLOOKUP(...), 0) evaluates the lookup twice. With LET the lookup is stored once and reused, reducing recalculation time on large sheets.",
      "level": "Medium"
    },
    {
      "q": "What is the scope of a LET name?",
      "a": "Only the formula in which it is defined. Other cells cannot use it. For workbook-wide names use the Name Manager (Formulas > Name Manager).",
      "level": "Medium"
    },
    {
      "q": "How do you debug a long LET formula?",
      "a": "Change the final calculation temporarily to an intermediate name to see its value, or use Formulas > Evaluate Formula. Putting each pair on a new line with Alt+Enter also helps.",
      "level": "Hard"
    },
    {
      "q": "Rewrite =IF(SUM(B2:B10)>100000,SUM(B2:B10)*5%,0) using LET.",
      "a": "=LET(total,SUM(B2:B10),IF(total>100000,total*5%,0)).",
      "level": "Medium"
    }
  ],
  "practice": [
    {
      "task": "B2 = 2500 (price), C2 = 10% (discount). Using LET, calculate the final price after discount and then add 18% GST.",
      "hint": "Name the discounted price first.",
      "solution": "=LET(price,B2, disc_price,price*(1-C2), disc_price*1.18) returns 2655 (2500 x 0.9 = 2250; 2250 x 1.18 = 2655)."
    },
    {
      "task": "Units sold in B2 = 120 and target in C2 = 100. Return \"Achieved 120%\" style text using LET.",
      "hint": "Calculate pct, then join with TEXT.",
      "solution": "=LET(pct,B2/C2, \"Achieved \"&TEXT(pct,\"0%\")) returns Achieved 120%."
    },
    {
      "task": "Sales in B2:B7 are 45000, 62000, 38000, 71000, 50000, 54000. Using LET, return the difference between the highest and lowest sale.",
      "hint": "Name max and min.",
      "solution": "=LET(s,B2:B7, hi,MAX(s), lo,MIN(s), hi-lo) returns 71000 - 38000 = 33000."
    },
    {
      "task": "Attendance: days present in B2 = 22, working days in C2 = 26. If attendance % is at least 75% return \"Eligible\" else \"Not Eligible\", and show the % in brackets.",
      "hint": "Name the percentage.",
      "solution": "=LET(p,B2/C2, IF(p>=75%,\"Eligible\",\"Not Eligible\")&\" (\"&TEXT(p,\"0.0%\")&\")\") returns Eligible (84.6%)."
    }
  ],
  "quiz": [
    {
      "question": "What does =LET(x,4,y,x*3,x+y) return?",
      "options": [
        "7",
        "12",
        "16",
        "4"
      ],
      "answer": 2,
      "explanation": "y = 12, so x + y = 16."
    },
    {
      "question": "The last argument of LET is:",
      "options": [
        "The first name",
        "The final calculation",
        "A range",
        "Optional"
      ],
      "answer": 1,
      "explanation": "LET always ends with the calculation."
    },
    {
      "question": "Which LET name is valid?",
      "options": [
        "A1",
        "total sales",
        "tax_amt",
        "TAX1"
      ],
      "answer": 2,
      "explanation": "tax_amt has no space and is not a cell reference."
    },
    {
      "question": "Main benefit of LET is:",
      "options": [
        "Formats cells",
        "Avoids repeating the same calculation",
        "Creates charts",
        "Protects sheets"
      ],
      "answer": 1,
      "explanation": "Expressions are computed once and reused by name."
    },
    {
      "question": "Where can a LET variable be used?",
      "options": [
        "Anywhere in the workbook",
        "Only in the same sheet",
        "Only inside the same formula",
        "In VBA"
      ],
      "answer": 2,
      "explanation": "LET names are local to the formula."
    }
  ]
};
