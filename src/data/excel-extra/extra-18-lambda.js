export default {
  "id": "extra-18-lambda",
  "title": "LAMBDA()",
  "module": "Additional Job-Oriented Skills",
  "extraNo": 18,
  "level": "Advanced",
  "duration": "1.5 hours",
  "summary": "LAMBDA() lets you create your own custom Excel functions without VBA. You write the logic once, save it with a name in the Name Manager, and then use it like a built-in function such as =ADDGST(1000,18%).",
  "objectives": [
    "Write a LAMBDA with parameters and a calculation",
    "Test a LAMBDA directly in a cell before saving it",
    "Save a LAMBDA as a named custom function in Name Manager",
    "Use LAMBDA helper functions MAP, BYROW, SCAN and REDUCE"
  ],
  "theory": [
    {
      "heading": "What is LAMBDA()?",
      "content": "LAMBDA creates a **reusable function**. You define input names (parameters) and a formula that uses them.\n\nExample: `=LAMBDA(amount, rate, amount*(1+rate))` describes a function that adds tax. On its own it does nothing until you **call** it with values.\n\nLAMBDA is available in Microsoft 365 and Excel 2024.",
      "syntax": "=LAMBDA([parameter1, parameter2, ...], calculation)"
    },
    {
      "heading": "Arguments explained",
      "content": "- `parameter1, parameter2, ...` (optional, up to 253): names for the inputs. Same naming rules as LET: start with a letter, no spaces, cannot look like a cell reference.\n- `calculation` (required, last argument): the formula that uses the parameters and returns the result.\n\nIf you type `=LAMBDA(x,x*2)` alone in a cell and press Enter, you get **#CALC!** because the function was defined but never called."
    },
    {
      "heading": "Testing a LAMBDA in a cell",
      "content": "Call the LAMBDA immediately by putting the values in brackets right after it:\n\n`=LAMBDA(x, x*2)(5)` returns 10.\n\n`=LAMBDA(c, c*9/5+32)(37)` converts 37 C to 98.6 F.\n\nAlways test this way first. When the result is correct, copy the LAMBDA part (without the test values) and save it in the Name Manager.",
      "tip": "Combine LET inside LAMBDA for longer logic: =LAMBDA(b, LET(hra,b*40%, b+hra))."
    },
    {
      "heading": "Saving as a named custom function",
      "content": "1. Copy the LAMBDA formula, e.g. `=LAMBDA(amount, rate, amount*(1+rate))`.\n2. Go to **Formulas > Defined Names > Define Name** (or Formulas > Name Manager > New, shortcut Ctrl+F3).\n3. Name: `ADDGST`. Scope: Workbook. Comment: \"Adds GST to an amount\".\n4. Refers to: paste the LAMBDA formula. Click OK.\n5. Now in any cell type `=ADDGST(1000,18%)` and get 1180.\n\nThe function lives in this workbook only. To reuse it in another file, copy a sheet that uses it, or define it again.",
      "tip": "Use clear, unique names. A name that matches a built-in function cannot be used."
    },
    {
      "heading": "LAMBDA helper functions",
      "content": "These functions take a LAMBDA as an argument and apply it to every element:\n\n- `MAP(array, LAMBDA(x, ...))`: transforms each value. Same size output.\n- `BYROW(array, LAMBDA(row, ...))`: one result per row, e.g. row totals.\n- `BYCOL(array, LAMBDA(col, ...))`: one result per column.\n- `SCAN(initial, array, LAMBDA(acc, x, ...))`: running results, e.g. running total.\n- `REDUCE(initial, array, LAMBDA(acc, x, ...))`: reduces to a single final value.\n- `MAKEARRAY(rows, cols, LAMBDA(r, c, ...))`: builds an array from row/column numbers.",
      "points": [
        "=SCAN(0,B2:B5,LAMBDA(a,x,a+x)) -> running total",
        "=REDUCE(0,B2:B5,LAMBDA(a,x,a+x)) -> grand total"
      ]
    }
  ],
  "examples": [
    {
      "title": "Test a LAMBDA in a cell",
      "scenario": "Before saving a temperature conversion function, test it for 37 C.",
      "steps": [
        "Click any empty cell, e.g. B2",
        "Type =LAMBDA(c, c*9/5+32)(37)",
        "Press Enter"
      ],
      "code": "=LAMBDA(c, c*9/5+32)(37)",
      "result": "98.6",
      "explanation": "37 x 9 / 5 = 66.6, plus 32 = 98.6. The (37) at the end passes the value to parameter c."
    },
    {
      "title": "Create a custom ADDGST function",
      "scenario": "The billing team adds GST on many sheets. Create =ADDGST(amount, rate).",
      "table": {
        "headers": [
          "A: Item",
          "B: Amount (₹)",
          "C: GST Rate",
          "D: Amount with GST"
        ],
        "rows": [
          [
            "Printer",
            "1000",
            "18%",
            "(formula)"
          ],
          [
            "Rice bag",
            "2500",
            "5%",
            "(formula)"
          ],
          [
            "Mobile",
            "15000",
            "12%",
            "(formula)"
          ]
        ]
      },
      "steps": [
        "Formulas > Name Manager > New (or Ctrl+F3 > New)",
        "Name: ADDGST",
        "Refers to: =LAMBDA(amount, rate, amount*(1+rate))",
        "Click OK and Close",
        "Click D2, type =ADDGST(B2,C2), press Enter and fill down to D4"
      ],
      "code": "=LAMBDA(amount, rate, amount*(1+rate))\n=ADDGST(B2,C2)",
      "result": "D2 = 1180, D3 = 2625, D4 = 16800",
      "explanation": "1000 x 1.18 = 1180; 2500 x 1.05 = 2625; 15000 x 1.12 = 16800. The logic is stored once in the Name Manager."
    },
    {
      "title": "Custom GRADE function for result sheet",
      "scenario": "Create =GRADE(marks): 75+ Distinction, 60+ First, 35+ Pass, else Fail.",
      "table": {
        "headers": [
          "A: Student",
          "B: Marks",
          "C: Result"
        ],
        "rows": [
          [
            "Riya",
            "82",
            "(formula)"
          ],
          [
            "Aman",
            "67",
            "(formula)"
          ],
          [
            "Neha",
            "45",
            "(formula)"
          ],
          [
            "Vikas",
            "30",
            "(formula)"
          ]
        ]
      },
      "steps": [
        "Test first: =LAMBDA(m, IF(m>=75,\"Distinction\",IF(m>=60,\"First\",IF(m>=35,\"Pass\",\"Fail\"))))(82) returns Distinction",
        "Formulas > Define Name, Name: GRADE, Refers to: the LAMBDA without (82)",
        "In C2 type =GRADE(B2) and fill down to C5"
      ],
      "code": "=LAMBDA(m, IF(m>=75,\"Distinction\",IF(m>=60,\"First\",IF(m>=35,\"Pass\",\"Fail\"))))",
      "result": "Distinction, First, Pass, Fail",
      "explanation": "82>=75 Distinction; 67>=60 First; 45>=35 Pass; 30 is below 35 so Fail."
    },
    {
      "title": "10% increment for all salaries with MAP",
      "scenario": "Show the new salary after a 10% increment for every employee with one formula.",
      "table": {
        "headers": [
          "A: Employee",
          "B: Salary (₹)"
        ],
        "rows": [
          [
            "Suresh",
            "20000"
          ],
          [
            "Meena",
            "25000"
          ],
          [
            "Ajay",
            "30000"
          ],
          [
            "Farah",
            "40000"
          ]
        ]
      },
      "steps": [
        "Click C2",
        "Type =MAP(B2:B5, LAMBDA(x, x*1.1))",
        "Press Enter: results spill to C5"
      ],
      "code": "=MAP(B2:B5, LAMBDA(x, x*1.1))",
      "result": "22000, 27500, 33000, 44000",
      "explanation": "MAP passes each salary to x one by one and returns x*1.1 for each."
    },
    {
      "title": "Row totals with BYROW and running total with SCAN",
      "scenario": "Quarterly sales by region are in B2:D4. Get each region's total, and a running total of the regional totals.",
      "table": {
        "headers": [
          "A: Region",
          "B: Q1",
          "C: Q2",
          "D: Q3"
        ],
        "rows": [
          [
            "North",
            "100",
            "120",
            "130"
          ],
          [
            "South",
            "90",
            "110",
            "95"
          ],
          [
            "East",
            "150",
            "140",
            "160"
          ]
        ]
      },
      "steps": [
        "Click E2, type =BYROW(B2:D4, LAMBDA(r, SUM(r))) and press Enter",
        "Click F2, type =SCAN(0, E2#, LAMBDA(a, x, a+x)) and press Enter",
        "Click G2, type =REDUCE(0, B2:D4, LAMBDA(a, x, a+x)) for the grand total"
      ],
      "code": "=BYROW(B2:D4, LAMBDA(r, SUM(r)))\n=SCAN(0, E2#, LAMBDA(a, x, a+x))\n=REDUCE(0, B2:D4, LAMBDA(a, x, a+x))",
      "result": "E2:E4 = 350, 295, 450; F2:F4 = 350, 645, 1095; G2 = 1095",
      "explanation": "BYROW sends each row to r. SCAN keeps an accumulator a starting at 0 and adds each row total. REDUCE does the same but returns only the final value."
    }
  ],
  "interview": [
    {
      "q": "What is LAMBDA in Excel?",
      "a": "A function that lets users create custom reusable functions using Excel formulas. You define parameters and a calculation, then save it with a name in the Name Manager and call it like a built-in function.",
      "level": "Easy"
    },
    {
      "q": "Why does =LAMBDA(x,x+1) show #CALC! in a cell?",
      "a": "Because the LAMBDA is defined but not called. Call it with a value =LAMBDA(x,x+1)(5), or save it in the Name Manager and use the name.",
      "level": "Medium"
    },
    {
      "q": "How do you save a LAMBDA as a custom function?",
      "a": "Formulas > Name Manager > New (Ctrl+F3). Enter a name like ADDGST, paste the LAMBDA formula in Refers to, click OK. Then use =ADDGST(...) anywhere in that workbook.",
      "level": "Medium"
    },
    {
      "q": "How is LAMBDA different from a VBA UDF?",
      "a": "LAMBDA uses only formulas, needs no macro-enabled .xlsm file, no security warnings, and works in Excel for the web. VBA UDFs can do more (loops, file access) but require macros to be enabled.",
      "level": "Medium"
    },
    {
      "q": "Explain MAP, BYROW and REDUCE.",
      "a": "MAP applies a LAMBDA to each element and returns an array of the same size. BYROW applies a LAMBDA to each row and returns one value per row. REDUCE carries an accumulator through all elements and returns one final value.",
      "level": "Hard"
    },
    {
      "q": "Can a LAMBDA call itself?",
      "a": "Yes, when saved with a name it can be recursive, e.g. a name FACT = LAMBDA(n, IF(n<=1,1,n*FACT(n-1))). =FACT(5) returns 120. A stopping condition is essential.",
      "level": "Hard"
    },
    {
      "q": "How many parameters can a LAMBDA have?",
      "a": "Up to 253 parameters. Optional parameters can be marked by wrapping in square brackets and checked with ISOMITTED().",
      "level": "Hard"
    },
    {
      "q": "What is the difference between LET and LAMBDA?",
      "a": "LET names values inside one formula. LAMBDA defines a reusable function with inputs that can be saved and called from many cells.",
      "level": "Easy"
    }
  ],
  "practice": [
    {
      "task": "Test a LAMBDA that returns the area of a rectangle for length 12 and width 8.",
      "hint": "Two parameters, call with (12,8).",
      "solution": "=LAMBDA(l,w,l*w)(12,8) returns 96."
    },
    {
      "task": "Create a named function DISC(price, pct) that returns the price after discount, and use it for price 5000 with 15% discount.",
      "hint": "Formulas > Name Manager > New.",
      "solution": "Name: DISC, Refers to: =LAMBDA(price,pct,price*(1-pct)). In a cell: =DISC(5000,15%) returns 4250."
    },
    {
      "task": "Marks in B2:B6 are 45, 78, 33, 90, 60. Using MAP, return \"Pass\" if marks >= 35 else \"Fail\" for all at once.",
      "hint": "MAP with an IF inside.",
      "solution": "=MAP(B2:B6,LAMBDA(m,IF(m>=35,\"Pass\",\"Fail\"))) returns Pass, Pass, Fail, Pass, Pass."
    },
    {
      "task": "Daily sales B2:B6 are 5000, 7000, 6000, 8000, 4000. Show the running total using SCAN.",
      "hint": "Initial value 0.",
      "solution": "=SCAN(0,B2:B6,LAMBDA(a,x,a+x)) returns 5000, 12000, 18000, 26000, 30000."
    },
    {
      "task": "Create a named function NETSAL(basic) = basic + 40% HRA + 10% DA - 12% PF, using LET inside LAMBDA. Test it on 30000.",
      "hint": "Put LET inside the LAMBDA calculation.",
      "solution": "Name NETSAL, Refers to: =LAMBDA(basic, LET(hra,basic*40%, da,basic*10%, pf,basic*12%, basic+hra+da-pf)). =NETSAL(30000) returns 41400."
    }
  ],
  "quiz": [
    {
      "question": "What does =LAMBDA(x,y,x*y)(4,5) return?",
      "options": [
        "9",
        "20",
        "#CALC!",
        "45"
      ],
      "answer": 1,
      "explanation": "The LAMBDA is called with x=4 and y=5."
    },
    {
      "question": "Where do you save a LAMBDA to use it as a named function?",
      "options": [
        "Data > Data Validation",
        "Formulas > Name Manager",
        "Home > Styles",
        "File > Options"
      ],
      "answer": 1,
      "explanation": "A LAMBDA becomes a function by defining a name for it."
    },
    {
      "question": "Typing =LAMBDA(x,x*2) alone in a cell shows:",
      "options": [
        "0",
        "#NAME?",
        "#CALC!",
        "#VALUE!"
      ],
      "answer": 2,
      "explanation": "A LAMBDA that is not called returns #CALC!."
    },
    {
      "question": "Which helper returns one result for each row of a range?",
      "options": [
        "MAP",
        "BYROW",
        "REDUCE",
        "SCAN"
      ],
      "answer": 1,
      "explanation": "BYROW applies the LAMBDA row by row."
    },
    {
      "question": "=REDUCE(0,{1,2,3},LAMBDA(a,x,a+x)) returns:",
      "options": [
        "0",
        "3",
        "6",
        "{1,3,6}"
      ],
      "answer": 2,
      "explanation": "REDUCE returns only the final accumulated value 6; SCAN would return {1,3,6}."
    }
  ]
};
