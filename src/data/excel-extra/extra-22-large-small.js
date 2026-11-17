export default {
  "id": "extra-22-large-small",
  "title": "LARGE() and SMALL()",
  "module": "Additional Job-Oriented Skills",
  "extraNo": 22,
  "level": "Intermediate",
  "duration": "1 hour",
  "summary": "LARGE() returns the k-th highest value and SMALL() returns the k-th lowest value in a list. They are used for Top 3 / Bottom 3 reports, finding the 2nd highest salary and building sorted lists.",
  "objectives": [
    "Write LARGE() and SMALL() with array and k",
    "Find top-N and bottom-N values and their totals/averages",
    "Return the name linked to the k-th value with INDEX/MATCH or XLOOKUP",
    "Understand how duplicates, text and invalid k are handled"
  ],
  "theory": [
    {
      "heading": "What are LARGE() and SMALL()?",
      "content": "MAX gives only the highest value. LARGE can give the 1st, 2nd, 3rd... highest. MIN gives only the lowest; SMALL gives the 1st, 2nd, 3rd... lowest.\n\n- `LARGE(range,1)` = MAX(range)\n- `SMALL(range,1)` = MIN(range)",
      "syntax": "=LARGE(array, k)\n=SMALL(array, k)"
    },
    {
      "heading": "Arguments explained",
      "content": "- `array` (required): the range or array of numbers, e.g. B2:B8.\n- `k` (required): the position from the top (LARGE) or bottom (SMALL). k = 1 is the highest/lowest, k = 2 is the second, and so on.\n\nRules:\n- Text, logical values and empty cells in the range are ignored.\n- If k <= 0 or k is greater than the count of numbers, the result is **#NUM!**.\n- If the range contains an error, the result is that error (use AGGREGATE(14/15,6,...) to ignore errors).",
      "tip": "Dates are numbers, so SMALL(dates,1) gives the earliest date and LARGE(dates,1) the latest."
    },
    {
      "heading": "Duplicates are counted separately",
      "content": "For marks {90, 90, 80}: LARGE(...,1) = 90 and LARGE(...,2) = **90** (not 80). If you need the 2nd highest DISTINCT value, remove duplicates first:\n\n`=LARGE(UNIQUE(B2:B8),2)` (Microsoft 365)"
    },
    {
      "heading": "Top-N with arrays",
      "content": "Give several k values at once:\n\n- `=LARGE(B2:B8,{1,2,3})` returns the top 3 values across a row.\n- `=LARGE(B2:B8,SEQUENCE(3))` returns the top 3 down a column (Microsoft 365).\n- `=SUM(LARGE(B2:B8,{1,2,3}))` = total of the top 3.\n\nTo show the NAME belonging to a value, look it up: `=INDEX(A2:A8,MATCH(LARGE(B2:B8,1),B2:B8,0))`.",
      "tip": "If two people have the same value, MATCH/XLOOKUP returns the first name both times. For full Top-N tables in Microsoft 365, =TAKE(SORTBY(A2:B8,B2:B8,-1),3) is simpler."
    }
  ],
  "examples": [
    {
      "title": "Top 3 sales values",
      "scenario": "Find the 1st, 2nd and 3rd highest sales.",
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
          ],
          [
            "Vikas",
            "29000"
          ]
        ]
      },
      "steps": [
        "Click D2 and type =LARGE($B$2:$B$8,1)",
        "Click D3 and type =LARGE($B$2:$B$8,2)",
        "Click D4 and type =LARGE($B$2:$B$8,3)"
      ],
      "code": "=LARGE($B$2:$B$8,1)\n=LARGE($B$2:$B$8,2)\n=LARGE($B$2:$B$8,3)",
      "result": "71000, 62000, 54000",
      "explanation": "Sorted high to low the list is 71000, 62000, 54000, 50000, 45000, 38000, 29000. In Microsoft 365, =LARGE(B2:B8,SEQUENCE(3)) returns all three at once."
    },
    {
      "title": "Bottom 2 sales and average of bottom 3",
      "scenario": "Identify the weakest performers' figures.",
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
          ],
          [
            "Vikas",
            "29000"
          ]
        ]
      },
      "steps": [
        "In E2 type =SMALL($B$2:$B$8,1)",
        "In E3 type =SMALL($B$2:$B$8,2)",
        "In E5 type =AVERAGE(SMALL(B2:B8,{1,2,3}))"
      ],
      "code": "=SMALL($B$2:$B$8,1)\n=SMALL($B$2:$B$8,2)\n=AVERAGE(SMALL(B2:B8,{1,2,3}))",
      "result": "29000, 38000 and average of bottom 3 = 37333.33",
      "explanation": "Bottom 3 are 29000, 38000, 45000. Sum = 112000, divided by 3 = 37333.33."
    },
    {
      "title": "Total of top 3 sales",
      "scenario": "The incentive pool is 5% of the top 3 sales. First find the total of the top 3.",
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
          ],
          [
            "Vikas",
            "29000"
          ]
        ]
      },
      "steps": [
        "Click D7",
        "Type =SUM(LARGE(B2:B8,{1,2,3}))",
        "Press Enter",
        "In D8 type =D7*5%"
      ],
      "code": "=SUM(LARGE(B2:B8,{1,2,3}))",
      "result": "D7 = 187000, D8 = 9350",
      "explanation": "71000 + 62000 + 54000 = 187000. 5% of 187000 = 9350."
    },
    {
      "title": "Name of the top and 2nd performer",
      "scenario": "Show who is 1st and 2nd.",
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
          ],
          [
            "Vikas",
            "29000"
          ]
        ]
      },
      "steps": [
        "In F2 type =INDEX($A$2:$A$8,MATCH(LARGE($B$2:$B$8,1),$B$2:$B$8,0))",
        "In F3 type =XLOOKUP(LARGE($B$2:$B$8,2),$B$2:$B$8,$A$2:$A$8)"
      ],
      "code": "=INDEX($A$2:$A$8,MATCH(LARGE($B$2:$B$8,1),$B$2:$B$8,0))\n=XLOOKUP(LARGE($B$2:$B$8,2),$B$2:$B$8,$A$2:$A$8)",
      "result": "F2 = Pooja, F3 = Neha",
      "explanation": "LARGE finds the value (71000 / 62000), then MATCH or XLOOKUP finds which row it is in and returns the name."
    },
    {
      "title": "Earliest and 2nd latest due dates",
      "scenario": "Invoice due dates are listed. Find the earliest due date and the 2nd latest due date.",
      "table": {
        "headers": [
          "A: Invoice",
          "B: Due Date"
        ],
        "rows": [
          [
            "INV-101",
            "15-Apr-2025"
          ],
          [
            "INV-102",
            "05-Apr-2025"
          ],
          [
            "INV-103",
            "28-Apr-2025"
          ],
          [
            "INV-104",
            "20-Apr-2025"
          ]
        ]
      },
      "steps": [
        "In D2 type =SMALL(B2:B5,1)",
        "In D3 type =LARGE(B2:B5,2)",
        "Format D2:D3 as Date (Ctrl+1 > Date)"
      ],
      "code": "=SMALL(B2:B5,1)\n=LARGE(B2:B5,2)",
      "result": "05-Apr-2025 and 20-Apr-2025",
      "explanation": "Dates are stored as serial numbers, so SMALL/LARGE work on them. Without date formatting you would see 45752 and 45767."
    }
  ],
  "interview": [
    {
      "q": "What is the difference between MAX and LARGE?",
      "a": "MAX returns only the highest value. LARGE(array,k) returns the k-th highest; LARGE(array,1) equals MAX.",
      "level": "Easy"
    },
    {
      "q": "How do you find the second highest salary in Excel?",
      "a": "=LARGE(salary_range,2). If duplicates should be ignored, =LARGE(UNIQUE(salary_range),2).",
      "level": "Easy"
    },
    {
      "q": "What does LARGE return if k is larger than the number of values?",
      "a": "#NUM! error. It also returns #NUM! if k <= 0 or the array has no numbers.",
      "level": "Medium"
    },
    {
      "q": "How do LARGE/SMALL treat text and blanks?",
      "a": "They ignore them. Only numeric values (including dates) are considered.",
      "level": "Easy"
    },
    {
      "q": "How do you sum the top 5 values?",
      "a": "=SUM(LARGE(range,{1,2,3,4,5})) or in Microsoft 365 =SUM(LARGE(range,SEQUENCE(5))).",
      "level": "Medium"
    },
    {
      "q": "Duplicates: for {90,90,80}, what is LARGE(...,2)?",
      "a": "90. Each occurrence is counted separately.",
      "level": "Medium"
    },
    {
      "q": "How do you get the k-th largest value while ignoring errors?",
      "a": "=AGGREGATE(14,6,range,k). 14 = LARGE, option 6 ignores errors.",
      "level": "Hard"
    },
    {
      "q": "How would you show names for Top 3 when two people have the same sales?",
      "a": "MATCH returns the first match twice. Use =TAKE(SORTBY(names_and_sales,sales,-1),3) in Microsoft 365, or a helper unique rank column with COUNTIF tie-breaker and INDEX/MATCH on the rank.",
      "level": "Hard"
    }
  ],
  "practice": [
    {
      "task": "Salaries in B2:B7: 32000, 45000, 28000, 51000, 45000, 39000. Find the highest, 2nd highest and 3rd highest.",
      "hint": "Remember duplicates count.",
      "solution": "=LARGE(B2:B7,1) = 51000, =LARGE(B2:B7,2) = 45000, =LARGE(B2:B7,3) = 45000."
    },
    {
      "task": "With the same salaries, find the 2nd highest DISTINCT salary.",
      "hint": "Use UNIQUE.",
      "solution": "=LARGE(UNIQUE(B2:B7),2) = 45000 and =LARGE(UNIQUE(B2:B7),3) = 39000."
    },
    {
      "task": "Find the total of the 2 lowest salaries.",
      "hint": "SMALL with an array constant.",
      "solution": "=SUM(SMALL(B2:B7,{1,2})) = 28000 + 32000 = 60000."
    },
    {
      "task": "Names are in A2:A7 (Ajay, Bina, Chetan, Divya, Esha, Farhan) with the salaries above. Return the name of the lowest paid employee.",
      "hint": "Combine SMALL with XLOOKUP or INDEX/MATCH.",
      "solution": "=XLOOKUP(SMALL(B2:B7,1),B2:B7,A2:A7) returns Chetan."
    }
  ],
  "quiz": [
    {
      "question": "=LARGE({10,40,20,30},2) returns:",
      "options": [
        "20",
        "30",
        "40",
        "10"
      ],
      "answer": 1,
      "explanation": "Sorted high to low: 40, 30, 20, 10. The 2nd is 30."
    },
    {
      "question": "=SMALL({10,40,20,30},1) is the same as:",
      "options": [
        "MAX",
        "MIN",
        "AVERAGE",
        "COUNT"
      ],
      "answer": 1,
      "explanation": "SMALL with k=1 is the minimum."
    },
    {
      "question": "=LARGE(A1:A5,6) where A1:A5 has 5 numbers returns:",
      "options": [
        "0",
        "the smallest",
        "#NUM!",
        "#N/A"
      ],
      "answer": 2,
      "explanation": "k is greater than the count of values."
    },
    {
      "question": "=SUM(LARGE(B2:B8,{1,2,3})) gives:",
      "options": [
        "The 3rd highest value",
        "Total of top 3 values",
        "Average of top 3",
        "Count of top 3"
      ],
      "answer": 1,
      "explanation": "LARGE returns three values and SUM adds them."
    },
    {
      "question": "For {50,50,40}, LARGE(...,2) returns:",
      "options": [
        "40",
        "50",
        "45",
        "#NUM!"
      ],
      "answer": 1,
      "explanation": "Duplicates are counted separately."
    }
  ]
};
